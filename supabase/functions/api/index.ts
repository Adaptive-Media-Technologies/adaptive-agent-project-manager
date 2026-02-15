// Supabase Edge Function: API for AI Agents (v3)
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
//   PATCH  /api/tasks/:id                   - Update task { title?, status? }
//   DELETE /api/tasks/:id                   - Delete task
//   POST   /api/tasks/reorder               - Reorder { project_id, task_ids[] }
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
//   --- Time ---
//   POST   /api/time                        - Log time { task_id, minutes }
//
// Auth: x-api-key header (hashed against api_keys table) or Bearer <jwt>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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

  if (apiKey) {
    const hashHex = await hashKey(apiKey)
    const { data: keyRow } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key_hash', hashHex)
      .single()

    if (!keyRow) return json({ error: 'Invalid API key' }, 401)
    userId = keyRow.user_id
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

  try {
    // ===================
    // PHASE 1: API KEYS
    // ===================

    if (path === '/keys' && method === 'GET') {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, label, created_at, key_prefix')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return json(data)
    }

    if (path === '/keys' && method === 'POST') {
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

      // Return the raw key ONCE — it won't be retrievable again
      return json({ ...data, key: rawKey }, 201)
    }

    const keyMatch = path.match(/^\/keys\/([a-f0-9-]+)$/)
    if (keyMatch && method === 'DELETE') {
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
    // PHASE 2: TEAMS & SCOPED ACCESS
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

    // --- PROJECTS (team-scoped) ---
    if (path === '/projects' && method === 'GET') {
      const teamIds = await getUserTeamIds()

      // Get owned private projects + all team projects for user's teams
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
      const body = await req.json()
      const { name, team_id } = body
      if (!name) return json({ error: 'name required' }, 400)

      // If team project, verify user is a member
      if (team_id) {
        const teamIds = await getUserTeamIds()
        if (!teamIds.includes(team_id)) {
          return json({ error: 'Not a member of this team' }, 403)
        }
      }

      const insert: Record<string, unknown> = { name, owner_id: userId, type: team_id ? 'team' : 'private' }
      if (team_id) insert.team_id = team_id
      const { data, error } = await supabase.from('projects').insert(insert).select().single()
      if (error) throw error
      return json(data, 201)
    }

    // --- TASKS (with access check) ---
    if (path === '/tasks' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
      if (!(await canAccessProject(projectId))) return json({ error: 'Access denied' }, 403)
      const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position')
      if (error) throw error
      return json(data)
    }

    if (path === '/tasks' && method === 'POST') {
      const { project_id, title } = await req.json()
      if (!project_id || !title) return json({ error: 'project_id and title required' }, 400)
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)
      const { data: existing } = await supabase.from('tasks').select('position').eq('project_id', project_id).order('position', { ascending: false }).limit(1)
      const position = existing && existing.length > 0 ? existing[0].position + 1 : 0
      const { data, error } = await supabase.from('tasks').insert({ project_id, title, created_by: userId, position }).select().single()
      if (error) throw error
      return json(data, 201)
    }

    const taskMatch = path.match(/^\/tasks\/([a-f0-9-]+)$/)
    if (taskMatch && method === 'PATCH') {
      const id = taskMatch[1]
      const updates = await req.json()
      const allowed: Record<string, unknown> = {}
      if (updates.title) allowed.title = updates.title
      if (updates.status) allowed.status = updates.status
      const { data, error } = await supabase.from('tasks').update(allowed).eq('id', id).select().single()
      if (error) throw error
      return json(data)
    }

    if (taskMatch && method === 'DELETE') {
      const id = taskMatch[1]
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return json({ ok: true })
    }

    if (path === '/tasks/reorder' && method === 'POST') {
      const { project_id, task_ids } = await req.json()
      if (!project_id || !task_ids?.length) return json({ error: 'project_id and task_ids required' }, 400)
      if (!(await canAccessProject(project_id))) return json({ error: 'Access denied' }, 403)
      await Promise.all(task_ids.map((id: string, i: number) =>
        supabase.from('tasks').update({ position: i }).eq('id', id).eq('project_id', project_id)
      ))
      return json({ ok: true })
    }

    // --- TASK NOTES ---
    if (path === '/notes' && method === 'GET') {
      const taskId = url.searchParams.get('task_id')
      if (!taskId) return json({ error: 'task_id required' }, 400)
      const { data, error } = await supabase.from('notes').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
      if (error) throw error
      return json(data)
    }

    if (path === '/notes' && method === 'POST') {
      const { task_id, content } = await req.json()
      if (!task_id || !content) return json({ error: 'task_id and content required' }, 400)
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
    // PHASE 3: PROJECT NOTES
    // ===================

    if (path === '/project-notes' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
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

    // --- TIME ENTRIES ---
    if (path === '/time' && method === 'POST') {
      const { task_id, minutes } = await req.json()
      if (!task_id || !minutes) return json({ error: 'task_id and minutes required' }, 400)
      const { data, error } = await supabase.from('time_entries').insert({ task_id, user_id: userId, minutes }).select().single()
      if (error) throw error
      return json(data, 201)
    }

    return json({ error: 'Not found' }, 404)
  } catch (err: any) {
    return json({ error: err.message }, 500)
  }
})
