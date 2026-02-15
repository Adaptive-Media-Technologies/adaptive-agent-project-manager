import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(supabaseUrl, serviceKey)

  // Get calling user
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null
  let userEmail: string | null = null

  if (authHeader) {
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''))
    userId = user?.id ?? null
    userEmail = user?.email ?? null
  }

  // Query with service role (bypasses RLS)
  const { data: teams } = await admin.from('teams').select('*')
  const { data: members } = await admin.from('team_members').select('*')
  const { data: invites } = await admin.from('team_invites').select('*')

  // Check RLS policies
  const { data: policies } = await admin.rpc('get_policies_debug').catch(() => ({ data: null }))

  // Also try querying AS the user (with RLS)
  let userTeams = null
  if (authHeader) {
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data, error } = await userClient.from('teams').select('*')
    userTeams = { data, error }
  }

  const result = {
    callingUser: { userId, userEmail },
    allTeams: teams,
    allMembers: members,
    allInvites: invites,
    userTeamsWithRLS: userTeams,
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
