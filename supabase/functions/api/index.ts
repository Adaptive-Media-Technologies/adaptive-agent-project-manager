// Supabase Edge Function: API for AI Agents (OpenClaw)
// Deploy with: supabase functions deploy api
//
// Routes:
//   GET    /api/projects       - List projects
//   POST   /api/projects       - Create project { name }
//   GET    /api/tasks?project_id=xxx  - List tasks
//   POST   /api/tasks          - Create task { project_id, title }
//   PATCH  /api/tasks/:id      - Update task { title?, status? }
//   DELETE /api/tasks/:id      - Delete task
//   POST   /api/tasks/reorder  - Reorder { project_id, task_ids: string[] }
//   POST   /api/time           - Log time { task_id, minutes }
//
// Auth: Bearer <jwt> or x-api-key header (hashed against api_keys table)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api/, '')
  const method = req.method

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  // Debug route - no auth required (temporary)
  if (path === '/debug-teams' && method === 'GET') {
    const { data: teams } = await supabaseAdmin.from('teams').select('*')
    const { data: members } = await supabaseAdmin.from('team_members').select('*')
    const { data: invites } = await supabaseAdmin.from('team_invites').select('*')
    const { data: policies } = await supabaseAdmin.rpc('get_rls_policies').catch(() => ({ data: null }))
    return json({ teams, members, invites, policies })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Auth: JWT or API key
  const authHeader = req.headers.get('authorization')
  const apiKey = req.headers.get('x-api-key')

  let userId: string | null = null
  const supabase = createClient(supabaseUrl, serviceKey)

  if (apiKey) {
    // Hash and check against api_keys table
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

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
    return json({ error: 'Missing auth' }, 401)
  }

  try {
    // --- DEBUG TEAMS ---
    if (path === '/debug-teams' && method === 'GET') {
      const { data: teams } = await supabase.from('teams').select('*')
      const { data: members } = await supabase.from('team_members').select('*')
      const { data: invites } = await supabase.from('team_invites').select('*')
      
      // Check policies
      const { data: policies } = await supabase.rpc('pg_policies_list').catch(() => ({ data: null }))
      
      // Try as-user query using anon key + user's token
      let userTeams = null
      if (userId) {
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
        // Sign in as user to test RLS
        const { data: userData } = await supabase.from('team_members').select('*').eq('user_id', userId)
        userTeams = { membershipRows: userData }
      }
      
      return json({
        userId,
        allTeams: teams,
        allMembers: members,
        allInvites: invites,
        userMemberships: userTeams,
      })
    }

    // --- PROJECTS ---
    if (path === '/projects' && method === 'GET') {
      const { data, error } = await supabase.from('projects').select('*').eq('owner_id', userId).order('created_at')
      if (error) throw error
      return json(data)
    }

    if (path === '/projects' && method === 'POST') {
      const { name } = await req.json()
      if (!name) return json({ error: 'name required' }, 400)
      const { data, error } = await supabase.from('projects').insert({ name, owner_id: userId }).select().single()
      if (error) throw error
      return json(data, 201)
    }

    // --- TASKS ---
    if (path === '/tasks' && method === 'GET') {
      const projectId = url.searchParams.get('project_id')
      if (!projectId) return json({ error: 'project_id required' }, 400)
      const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position')
      if (error) throw error
      return json(data)
    }

    if (path === '/tasks' && method === 'POST') {
      const { project_id, title } = await req.json()
      if (!project_id || !title) return json({ error: 'project_id and title required' }, 400)
      // Get next position
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
      await Promise.all(task_ids.map((id: string, i: number) =>
        supabase.from('tasks').update({ position: i }).eq('id', id).eq('project_id', project_id)
      ))
      return json({ ok: true })
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
