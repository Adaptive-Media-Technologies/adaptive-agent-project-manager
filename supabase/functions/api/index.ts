// Supabase Edge Function: API for AI Agents
//
// Routes:
//   GET    /api/projects              - List projects (scoped to user's teams)
//   POST   /api/projects              - Create project { name, team_id? }
//   GET    /api/tasks?project_id=xxx  - List tasks
//   POST   /api/tasks                 - Create task { project_id, title }
//   PATCH  /api/tasks/:id             - Update task { title?, status? }
//   DELETE /api/tasks/:id             - Delete task
//   POST   /api/tasks/reorder         - Reorder { project_id, task_ids: string[] }
//   GET    /api/notes?task_id=xxx     - List notes for a task
//   POST   /api/notes                 - Create note { task_id, content }
//   DELETE /api/notes/:id             - Delete note
//   POST   /api/time                  - Log time { task_id, minutes }
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
    return json({ error: 'Missing auth. Use x-api-key or Authorization: Bearer <jwt>' }, 401)
  }

  try {
    // --- PROJECTS ---
    if (path === '/projects' && method === 'GET') {
      const { data, error } = await supabase.from('projects').select('*').eq('owner_id', userId).order('created_at')
      if (error) throw error
      return json(data)
    }

    if (path === '/projects' && method === 'POST') {
      const body = await req.json()
      const { name, team_id } = body
      if (!name) return json({ error: 'name required' }, 400)
      const insert: Record<string, unknown> = { name, owner_id: userId, type: team_id ? 'team' : 'private' }
      if (team_id) insert.team_id = team_id
      const { data, error } = await supabase.from('projects').insert(insert).select().single()
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

    // --- NOTES ---
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
