// Supabase Edge Function: API for AI Agents (v4)
//
// Routes:
//   --- Auth & Keys ---
//   GET    /api/keys                        - List user's API keys
//   POST   /api/keys                        - Generate API key { label? }
//   DELETE /api/keys/:id                    - Revoke API key
//
//   --- Teams ---
//   GET    /api/teams                       - List user's teams
//
//   --- Projects ---
//   GET    /api/projects                    - List projects (owned + team)
//   POST   /api/projects                    - Create project { name, team_id? }
//
//   --- Tasks ---
//   GET    /api/tasks?project_id=xxx        - List tasks
//   POST   /api/tasks                       - Create task { project_id, title }
//   PATCH  /api/tasks/:id                   - Update task { title?, status?, due_date?, start_date? }
//   DELETE /api/tasks/:id                   - Delete task
//   POST   /api/tasks/reorder               - Reorder { project_id, task_ids[] } or grouped { project_id, groups: [{ group_id, task_ids[] }] }
//
//   --- Task Notes ---
//   GET    /api/notes?task_id=xxx           - List notes for a task
//   POST   /api/notes                       - Create note { task_id, content }
//   DELETE /api/notes/:id                   - Delete note
//
//   --- Project Notes ---
//   GET    /api/project-notes?project_id=x  - Get project note
//   PUT    /api/project-notes               - Upsert { project_id, content, color? }
//
//   --- Chat ---
//   GET    /api/chat?project_id=xxx         - List recent messages (50)
//   POST   /api/chat                        - Send message { project_id, content }
//
//   --- Time ---
//   POST   /api/time                        - Log time { task_id, minutes }
//
// Auth: x-api-key header (agents table first, then api_keys table) or Bearer <jwt>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

// Generate a random API key string
function generateApiKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return 'ak_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// SHA-256 hash a string
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, '')
  const method = req.method

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  // --- AUTH ---
  const authHeader = req.headers.get('authorization')
  const apiKey = req.headers.get('x-api-key')

  let userId: string | null = null
  let scopedProjectIds: string[] | null = null  // null = no restriction (user-level keys)
  let agentId: string | null = null  // set when authenticated as an agent

  if (apiKey) {
    const hashHex = await hashKey(apiKey)

    // 1. Check agents table first (project-scoped keys)
    const { data: agentRow } = await supabase
      .from('agents')
      .select('id, owner_id')
      .eq('key_hash', hashHex)
      .single()

    if (agentRow) {
      userId = agentRow.owner_id
      agentId = agentRow.id
      // Look up assigned projects from junction table
      const { data: assignments } = await supabase
        .from('agent_projects')
        .select('project_id')
        .eq('agent_id', agentRow.id)
      scopedProjectIds = (assignments || []).map((r: any) => r.project_id)
    } else {
      // 2. Fall back to user-level api_keys table
      const { data: keyRow } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key_hash', hashHex)
        .single()

      if (!keyRow) return json({ error: 'Invalid API key' }, 401)
      userId = keyRow.user_id
    }
  } else if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data: { user }, error } = await anonClient.auth.getUser(token)
    if (error || !user) return json({ error: 'Invalid token' }, 401)
    userId = user.id
  } else {
    return json({ error: 'Missing auth. Use x-api-key or Authorization: Bearer <jwt>' }, 401)
  }

  // Helper: get team IDs the user belongs to
  async function getUserTeamIds(): Promise<string[]> {
    const { data } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId!)
    return (data || []).map(r => r.team_id)
  }

  // Helper: check user has access to a project (owns it or is member of its team)
  async function canAccessProject(projectId: string): Promise<boolean> {
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id, team_id')
      .eq('id', projectId)
      .single()
    if (!project) return false
    if (project.owner_id === userId) return true
    if (project.team_id) {
      const teamIds = await getUserTeamIds()
      return teamIds.includes(project.team_id)
    }
    return false
  }

  // Helper: enforce scope restriction for agent keys
  function checkScope(projectId: string): Response | null {
    if (scopedProjectIds && scopedProjectIds.length > 0 && !scopedProjectIds.includes(projectId)) {
      return json({ error: 'Agent is not assigned to this project' }, 403)
    }
    return null
  }

  try {
    // ===================
    // API KEYS (user-level only, not available to scoped agents)
    // ===================

    if (path === '/keys' && method === 'GET') {
      if (scopedProjectIds) return json({ error: 'Agent keys cannot manage API keys' }, 403)
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, label, created_at, key_prefix')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return json(data)
    }

    if (path === '/keys' && method === 'POST') {
      if (scopedProjectIds) return json({ error: 'Agent keys cannot manage API keys' }, 403)
      const body = await req.json().catch(() => ({}))
      const label = body.label || 'default'
      const rawKey = generateApiKey()
      const keyHash = await hashKey(rawKey)
      const keyPrefix = rawKey.substring(0, 10) + '...'

      const { data, error } = await supabase
        .from('api_keys')
        .insert({ user_id: userId, key_hash: keyHash, label, key_prefix: keyPrefix })
        .select('id, label, created_at, key_prefix')
        .single()
      if (error) throw error

      return json({ ...data, key: rawKey }, 201)
    }

    const keyMatch = path.match(/^\/keys\/([a-f0-9-]+)$/)
    if (keyMatch && method === 'DELETE') {
      if (scopedProjectIds) return json({ error: 'Agent keys cannot manage API keys' }, 403)
      const id = keyMatch[1]
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
      return json({ ok: true })
    }

    // ===================
    // TEAMS
    // ===================

    if (path === '/teams' && method === 'GET') {
      const teamIds = await getUserTeamIds()
      if (teamIds.length === 0) return json([])
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds)
        .order('created_at')
      if (error) throw error
      return json(data)
    }

    // ===================
    // PROJECTS
    // ===================

    if (path === '/projects' && method === 'GET') {
      // Scoped agents can only see their assigned project
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .in('id', scopedProjectIds)
        if (error) throw error
        return json(data || [])
      }

      const teamIds = await getUserTeamIds()
      let query = supabase.from('projects').select('*').order('created_at')
      if (teamIds.length > 0) {
        query = query.or(`owner_id.eq.${userId},team_id.in.(${teamIds.join(',')})`)
      } else {
        query = query.eq('owner_id', userId)
      }
      const { data, error } = await query
      if (error) throw error
      return json(data)
    }

    if (path === '/projects' && method === 'POST') {
      if (scopedProjectIds) return json({ error: 'Agent keys cannot create projects' }, 403)
      const body = await req.json()
      const { name, team_id } = body
      if (!name) return json({ error: 'name required' }, 400)

      if (team_id) {
        const teamIds = await getUserTeamIds()
        if (!teamIds.includes(team_id)) return json({ error: 'Not a member of this team' }, 403)
      }

      const insert: Record<string, unknown> = { name, owner_id: userId, type: team_id ? 'team' : 'private' }
      if (team_id) insert.team_id = team_id
      const { data, error } = await supabase.from('projects').insert(insert).select().single()
      if (error) throw error
      return json(data, 201)
    }

    // ===================
    // TASKS
    // ===================

    // Helper: enrich tasks with assignee info
    async function enrichTasksWithAssignee(tasks: any[]) {
      if (!tasks || tasks.length === 0) return tasks
      const userIds = [...new Set(tasks.filter(t => t.assigned_to && t.assigned_type === 'user').map(t => t.assigned_to))]
      const agentIds = [...new Set(tasks.filter(t => t.assigned_to && t.assigned_type === 'agent').map(t => t.assigned_to))]
      
      let profileMap: Record<string, any> = {}
      let agentMap: Record<string, any> = {}
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, username, display_name').in('id', userIds)
        for (const p of (profiles || [])) profileMap[p.id] = p
      }
      if (agentIds.length > 0) {
        const { data: agents } = await supabase.from('agents').select('id, display_name, email').in('id', agentIds)
        for (const a of (agents || [])) agentMap[a.id] = a
      }
      
      return tasks.map(t => {
        const assignee: Record<string, unknown> = { assigned_to: t.assigned_to, assigned_type: t.assigned_type }
        if (t.assigned_to && t.assigned_type === 'user' && profileMap[t.assigned_to]) {
          assignee.assignee_username = profileMap[t.assigned_to].username
          assignee.assignee_display_name = profileMap[t.assigned_to].display_name
        } else if (t.assigned_to && t.assigned_type === 'agent' && agentMap[t.assigned_to]) {
          assignee.assignee_display_name = agentMap[t.assigned_to].display_name
          assignee.assignee_username = null
        }
        return { ...t, ...assignee }
      })
    }

    // Helper: resolve assign_to username to user/agent id
    async function resolveAssignee(username: string, projectId: string): Promise<{ assigned_to: string, assigned_type: string } | null> {
      // Check agents first (by display_name, case-insensitive)
      const { data: agentMatches } = await supabase
        .from('agents')
        .select('id, display_name')
      
      if (agentMatches) {
        // Filter to agents assigned to this project
        const { data: assignments } = await supabase
          .from('agent_projects')
          .select('agent_id')
          .eq('project_id', projectId)
        const assignedAgentIds = new Set((assignments || []).map((a: any) => a.agent_id))
        
        const match = agentMatches.find(a => 
          assignedAgentIds.has(a.id) && a.display_name.toLowerCase() === username.toLowerCase()
        )
        if (match) return { assigned_to: match.id, assigned_type: 'agent' }
      }
      
      // Check profiles by username
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', username)
        .single()
      
      if (profile) return { assigned_to: profile.id, assigned_type: 'user' }
      
      return null
    }

    if (path === '/tasks' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
      const scopeError = checkScope(projectId)
      if (scopeError) return scopeError
      if (!(await canAccessProject(projectId))) return json({ error: 'Access denied' }, 403)
      const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position')
      if (error) throw error
      return json(await enrichTasksWithAssignee(data || []))
    }

    if (path === '/tasks' && method === 'POST') {
      const body = await req.json()
      const { project_id, title, assign_to, group_id, start_date, due_date } = body
      if (!project_id || !title) return json({ error: 'project_id and title required' }, 400)
      const scopeError = checkScope(project_id)
      if (scopeError) return scopeError
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)
      const { data: existing } = await supabase.from('tasks').select('position').eq('project_id', project_id).order('position', { ascending: false }).limit(1)
      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0
      
      const insert: Record<string, unknown> = { project_id, title, created_by: userId, position }
      if (group_id !== undefined) insert.group_id = group_id
      if (start_date !== undefined) insert.start_date = start_date
      if (due_date !== undefined) insert.due_date = due_date
      if (assign_to) {
        const resolved = await resolveAssignee(assign_to, project_id)
        if (!resolved) return json({ error: `Could not find user or agent with name "${assign_to}"` }, 400)
        insert.assigned_to = resolved.assigned_to
        insert.assigned_type = resolved.assigned_type
      }
      
      const { data, error } = await supabase.from('tasks').insert(insert).select().single()
      if (error) throw error
      const enriched = await enrichTasksWithAssignee([data])
      return json(enriched[0], 201)
    }

    const taskMatch = path.match(/^\/tasks\/([a-f0-9-]+)$/)
    if (taskMatch && method === 'PATCH') {
      const id = taskMatch[1]
      const updates = await req.json()
      const allowed: Record<string, unknown> = {}
      if (updates.title !== undefined) allowed.title = updates.title
      if (updates.status !== undefined) allowed.status = updates.status
      if (updates.due_date !== undefined) allowed.due_date = updates.due_date
      if (updates.start_date !== undefined) allowed.start_date = updates.start_date

      // If scoped, verify the task belongs to the scoped project
      let taskProjectId: string | null = null
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data: task } = await supabase.from('tasks').select('project_id').eq('id', id).single()
        if (!task || !scopedProjectIds.includes(task.project_id)) return json({ error: 'Access denied' }, 403)
        taskProjectId = task.project_id
      }

      // Handle assign_to by username
      if (updates.assign_to !== undefined) {
        if (updates.assign_to === null || updates.assign_to === '') {
          allowed.assigned_to = null
          allowed.assigned_type = null
        } else {
          // Need project_id to resolve agent assignments
          if (!taskProjectId) {
            const { data: task } = await supabase.from('tasks').select('project_id').eq('id', id).single()
            taskProjectId = task?.project_id || null
          }
          if (!taskProjectId) return json({ error: 'Task not found' }, 404)
          const resolved = await resolveAssignee(updates.assign_to, taskProjectId)
          if (!resolved) return json({ error: `Could not find user or agent with name "${updates.assign_to}"` }, 400)
          allowed.assigned_to = resolved.assigned_to
          allowed.assigned_type = resolved.assigned_type
        }
      }

      const { data, error } = await supabase.from('tasks').update(allowed).eq('id', id).select().single()
      if (error) throw error
      const enriched = await enrichTasksWithAssignee([data])
      return json(enriched[0])
    }

    if (taskMatch && method === 'DELETE') {
      const id = taskMatch[1]
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data: task } = await supabase.from('tasks').select('project_id').eq('id', id).single()
        if (!task || !scopedProjectIds.includes(task.project_id)) return json({ error: 'Access denied' }, 403)
      }
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return json({ ok: true })
    }

    if (path === '/tasks/reorder' && method === 'POST') {
      const body = await req.json()
      const { project_id, task_ids, groups } = body
      if (!project_id) return json({ error: 'project_id required' }, 400)
      const scopeError = checkScope(project_id)
      if (scopeError) return scopeError
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)

      // Back-compat: ungrouped reorder
      if (Array.isArray(task_ids) && task_ids.length > 0) {
        await Promise.all(task_ids.map((id: string, i: number) =>
          supabase.from('tasks').update({ position: i }).eq('id', id).eq('project_id', project_id)
        ))
        return json({ ok: true })
      }

      // Grouped reorder: update group_id + position per group
      if (!Array.isArray(groups) || groups.length === 0) {
        return json({ error: 'task_ids[] or groups[] required' }, 400)
      }

      const updates: Promise<any>[] = []
      for (const g of groups) {
        const gid = g.group_id ?? null
        const ids: string[] = Array.isArray(g.task_ids) ? g.task_ids : []
        ids.forEach((id: string, i: number) => {
          updates.push(
            supabase
              .from('tasks')
              .update({ group_id: gid, position: i })
              .eq('id', id)
              .eq('project_id', project_id)
          )
        })
      }
      await Promise.all(updates)
      return json({ ok: true })
    }

    // ===================
    // TASK NOTES
    // ===================

    if (path === '/notes' && method === 'GET') {
      const taskId = url.searchParams.get('task_id')
      if (!taskId) return json({ error: 'task_id required' }, 400)
      // If scoped, verify task belongs to scoped project
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data: task } = await supabase.from('tasks').select('project_id').eq('id', taskId).single()
        if (!task || !scopedProjectIds.includes(task.project_id)) return json({ error: 'Access denied' }, 403)
      }
      const { data, error } = await supabase.from('notes').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
      if (error) throw error
      return json(data)
    }

    if (path === '/notes' && method === 'POST') {
      const { task_id, content } = await req.json()
      if (!task_id || !content) return json({ error: 'task_id and content required' }, 400)
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data: task } = await supabase.from('tasks').select('project_id').eq('id', task_id).single()
        if (!task || !scopedProjectIds.includes(task.project_id)) return json({ error: 'Access denied' }, 403)
      }
      const { data, error } = await supabase.from('notes').insert({ task_id, user_id: userId, content }).select().single()
      if (error) throw error
      return json(data, 201)
    }

    const noteMatch = path.match(/^\/notes\/([a-f0-9-]+)$/)
    if (noteMatch && method === 'DELETE') {
      const id = noteMatch[1]
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      return json({ ok: true })
    }

    // ===================
    // PROJECT NOTES
    // ===================

    if (path === '/project-notes' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
      const scopeError = checkScope(projectId)
      if (scopeError) return scopeError
      if (!(await canAccessProject(projectId))) return json({ error: 'Access denied' }, 403)
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()
      if (error) throw error
      return json(data || { project_id: projectId, content: '', color: '' })
    }

    if (path === '/project-notes' && method === 'PUT') {
      const { project_id, content, color } = await req.json()
      if (!project_id) return json({ error: 'project_id required' }, 400)
      const scopeError = checkScope(project_id)
      if (scopeError) return scopeError
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)
      const upsertData: Record<string, unknown> = { project_id, updated_by: userId }
      if (content !== undefined) upsertData.content = content
      if (color !== undefined) upsertData.color = color
      const { data, error } = await supabase
        .from('project_notes')
        .upsert(upsertData, { onConflict: 'project_id' })
        .select()
        .single()
      if (error) throw error
      return json(data)
    }

    // ===================
    // CHAT
    // ===================

    if (path === '/chat' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
      const scopeError = checkScope(projectId)
      if (scopeError) return scopeError
      if (!(await canAccessProject(projectId))) return json({ error: 'Access denied' }, 403)
      const { data, error } = await supabase
        .from('project_messages')
        .select('id, project_id, user_id, content, sent_by_agent, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error

      // Enrich with sender metadata
      const msgs = data || []
      const userIds = [...new Set(msgs.map((m: any) => m.user_id))]
      const agentMsgIds = [...new Set(msgs.filter((m: any) => m.sent_by_agent).map((m: any) => m.sent_by_agent))]

      let profileMap: Record<string, any> = {}
      let agentMap: Record<string, any> = {}

      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', userIds)
        for (const p of (profiles || [])) profileMap[p.id] = p
      }
      if (agentMsgIds.length > 0) {
        const { data: agents } = await supabase.from('agents').select('id, display_name, email').in('id', agentMsgIds)
        for (const a of (agents || [])) agentMap[a.id] = a
      }

      const enriched = msgs.map((m: any) => ({
        ...m,
        sender_type: m.sent_by_agent ? 'agent' : 'user',
        sender_display_name: m.sent_by_agent
          ? agentMap[m.sent_by_agent]?.display_name || null
          : profileMap[m.user_id]?.display_name || null,
        sender_username: m.sent_by_agent
          ? null
          : profileMap[m.user_id]?.username || null,
        sender_avatar_url: m.sent_by_agent
          ? null
          : profileMap[m.user_id]?.avatar_url || null,
      }))

      return json(enriched)
    }

    if (path === '/chat' && method === 'POST') {
      const { project_id, content } = await req.json()
      if (!project_id || !content) return json({ error: 'project_id and content required' }, 400)
      const scopeError = checkScope(project_id)
      if (scopeError) return scopeError
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)
      const insertData: Record<string, unknown> = { project_id, user_id: userId, content }
      if (agentId) insertData.sent_by_agent = agentId
      const { data, error } = await supabase
        .from('project_messages')
        .insert(insertData)
        .select()
        .single()
      if (error) throw error
      return json(data, 201)
    }

    // ===================
    // TIME ENTRIES
    // ===================

    if (path === '/time' && method === 'POST') {
      const { task_id, minutes } = await req.json()
      if (!task_id || !minutes) return json({ error: 'task_id and minutes required' }, 400)
      if (scopedProjectIds && scopedProjectIds.length > 0) {
        const { data: task } = await supabase.from('tasks').select('project_id').eq('id', task_id).single()
        if (!task || !scopedProjectIds.includes(task.project_id)) return json({ error: 'Access denied' }, 403)
      }
      const { data, error } = await supabase.from('time_entries').insert({ task_id, user_id: userId, minutes }).select().single()
      if (error) throw error
      return json(data, 201)
    }

    return json({ error: 'Not found' }, 404)
  } catch (err: any) {
    return json({ error: err.message }, 500)
  }
})
