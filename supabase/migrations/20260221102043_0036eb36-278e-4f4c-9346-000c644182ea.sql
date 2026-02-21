
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Owners manage own agents" ON public.agents;
DROP POLICY IF EXISTS "Agent owners manage assignments" ON public.agent_projects;

-- Helper function: check if user shares a team with this agent via agent_projects
CREATE OR REPLACE FUNCTION public.is_agent_team_member(_agent_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.agent_projects ap
    JOIN public.projects p ON p.id = ap.project_id
    JOIN public.team_members tm ON tm.team_id = p.team_id
    WHERE ap.agent_id = _agent_id
      AND tm.user_id = _user_id
      AND p.type = 'team'
  )
$$;

-- Agents: owners always have full access
CREATE POLICY "Owners manage own agents"
  ON public.agents FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Agents: team members can SELECT, UPDATE, DELETE agents assigned to their team projects
CREATE POLICY "Team members can view agents"
  ON public.agents FOR SELECT
  USING (public.is_agent_team_member(id, auth.uid()));

CREATE POLICY "Team members can update agents"
  ON public.agents FOR UPDATE
  USING (public.is_agent_team_member(id, auth.uid()));

CREATE POLICY "Team members can delete agents"
  ON public.agents FOR DELETE
  USING (public.is_agent_team_member(id, auth.uid()));

-- Agent projects: owners manage assignments
CREATE POLICY "Agent owners manage assignments"
  ON public.agent_projects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_projects.agent_id
      AND agents.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agents
    WHERE agents.id = agent_projects.agent_id
      AND agents.owner_id = auth.uid()
  ));

-- Agent projects: team members can view and manage assignments for agents on their projects
CREATE POLICY "Team members can view agent assignments"
  ON public.agent_projects FOR SELECT
  USING (public.is_agent_team_member(agent_id, auth.uid()));

CREATE POLICY "Team members can insert agent assignments"
  ON public.agent_projects FOR INSERT
  WITH CHECK (public.is_agent_team_member(agent_id, auth.uid()));

CREATE POLICY "Team members can update agent assignments"
  ON public.agent_projects FOR UPDATE
  USING (public.is_agent_team_member(agent_id, auth.uid()));

CREATE POLICY "Team members can delete agent assignments"
  ON public.agent_projects FOR DELETE
  USING (public.is_agent_team_member(agent_id, auth.uid()));
