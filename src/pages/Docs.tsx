import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronRight, BookOpen, Key, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = "https://pdzbejpiilgwgqhmbrso.supabase.co/functions/v1/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-md bg-foreground/95 text-primary-foreground text-sm overflow-x-auto">
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
      <pre className="p-4 pr-12 font-mono leading-relaxed whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-600 text-white hover:bg-emerald-600",
  POST: "bg-blue-600 text-white hover:bg-blue-600",
  PUT: "bg-amber-600 text-white hover:bg-amber-600",
  PATCH: "bg-amber-600 text-white hover:bg-amber-600",
  DELETE: "bg-red-600 text-white hover:bg-red-600",
};

interface Endpoint {
  method: string;
  path: string;
  description: string;
  queryParams?: string;
  body?: string;
  curl: string;
  response: string;
}

const endpointGroups: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: "API Keys",
    endpoints: [
      {
        method: "GET",
        path: "/keys",
        description: "List your API keys (hash is never returned).",
        curl: `curl -H "x-api-key: ak_xxx" ${BASE_URL}/keys`,
        response: `[{ "id": "uuid", "label": "my-agent", "key_prefix": "ak_a1b2c3...", "created_at": "..." }]`,
      },
      {
        method: "POST",
        path: "/keys",
        description: "Generate a new API key. The raw key is returned ONCE in the response.",
        body: `{ "label": "my-agent" }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"label":"my-agent"}' \\\n  ${BASE_URL}/keys`,
        response: `{ "id": "uuid", "label": "my-agent", "key_prefix": "ak_a1b2...", "key": "ak_full_raw_key_here" }`,
      },
      {
        method: "DELETE",
        path: "/keys/:id",
        description: "Revoke an API key by its ID.",
        curl: `curl -X DELETE -H "x-api-key: ak_xxx" ${BASE_URL}/keys/<key-id>`,
        response: `{ "ok": true }`,
      },
    ],
  },
  {
    title: "Teams",
    endpoints: [
      {
        method: "GET",
        path: "/teams",
        description: "List teams the authenticated user belongs to.",
        curl: `curl -H "x-api-key: ak_xxx" ${BASE_URL}/teams`,
        response: `[{ "id": "uuid", "name": "My Team", "created_at": "..." }]`,
      },
    ],
  },
  {
    title: "Projects",
    endpoints: [
      {
        method: "GET",
        path: "/projects",
        description: "List all projects you own or have access to via teams.",
        curl: `curl -H "x-api-key: ak_xxx" ${BASE_URL}/projects`,
        response: `[{ "id": "uuid", "name": "Project Alpha", "type": "team", "team_id": "uuid", "owner_id": "uuid" }]`,
      },
      {
        method: "POST",
        path: "/projects",
        description: "Create a new project. Attach to a team with team_id.",
        body: `{ "name": "New Project", "team_id": "uuid" }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"New Project","team_id":"uuid"}' \\\n  ${BASE_URL}/projects`,
        response: `{ "id": "uuid", "name": "New Project", "type": "team", ... }`,
      },
    ],
  },
  {
    title: "Tasks",
    endpoints: [
      {
        method: "GET",
        path: "/tasks",
        description: "List tasks for a project, ordered by position.",
        queryParams: "project_id (required)",
        curl: `curl -H "x-api-key: ak_xxx" \\\n  "${BASE_URL}/tasks?project_id=<project-id>"`,
        response: `[{ "id": "uuid", "title": "Fix login bug", "status": "todo", "position": 0, ... }]`,
      },
      {
        method: "POST",
        path: "/tasks",
        description: "Create a new task in a project.",
        body: `{ "project_id": "uuid", "title": "Implement auth" }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"project_id":"uuid","title":"Implement auth"}' \\\n  ${BASE_URL}/tasks`,
        response: `{ "id": "uuid", "title": "Implement auth", "status": "todo", "position": 3, ... }`,
      },
      {
        method: "PATCH",
        path: "/tasks/:id",
        description: "Update a task's title or status.",
        body: `{ "title": "Updated title", "status": "done" }`,
        curl: `curl -X PATCH -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"status":"done"}' \\\n  ${BASE_URL}/tasks/<task-id>`,
        response: `{ "id": "uuid", "title": "Updated title", "status": "done", ... }`,
      },
      {
        method: "DELETE",
        path: "/tasks/:id",
        description: "Delete a task by ID.",
        curl: `curl -X DELETE -H "x-api-key: ak_xxx" ${BASE_URL}/tasks/<task-id>`,
        response: `{ "ok": true }`,
      },
      {
        method: "POST",
        path: "/tasks/reorder",
        description: "Reorder tasks within a project. Pass the full ordered list of task IDs.",
        body: `{ "project_id": "uuid", "task_ids": ["id1", "id2", "id3"] }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"project_id":"uuid","task_ids":["id1","id2","id3"]}' \\\n  ${BASE_URL}/tasks/reorder`,
        response: `{ "ok": true }`,
      },
    ],
  },
  {
    title: "Task Notes",
    endpoints: [
      {
        method: "GET",
        path: "/notes",
        description: "List notes for a specific task.",
        queryParams: "task_id (required)",
        curl: `curl -H "x-api-key: ak_xxx" \\\n  "${BASE_URL}/notes?task_id=<task-id>"`,
        response: `[{ "id": "uuid", "content": "Checked logs, issue is in middleware", "created_at": "..." }]`,
      },
      {
        method: "POST",
        path: "/notes",
        description: "Add a note to a task.",
        body: `{ "task_id": "uuid", "content": "Found the root cause" }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"task_id":"uuid","content":"Found the root cause"}' \\\n  ${BASE_URL}/notes`,
        response: `{ "id": "uuid", "task_id": "uuid", "content": "Found the root cause", ... }`,
      },
      {
        method: "DELETE",
        path: "/notes/:id",
        description: "Delete a note by ID.",
        curl: `curl -X DELETE -H "x-api-key: ak_xxx" ${BASE_URL}/notes/<note-id>`,
        response: `{ "ok": true }`,
      },
    ],
  },
  {
    title: "Project Notes",
    endpoints: [
      {
        method: "GET",
        path: "/project-notes",
        description: "Get the project-level note (one per project).",
        queryParams: "project_id (required)",
        curl: `curl -H "x-api-key: ak_xxx" \\\n  "${BASE_URL}/project-notes?project_id=<project-id>"`,
        response: `{ "project_id": "uuid", "content": "Sprint goals: ...", "color": "yellow" }`,
      },
      {
        method: "PUT",
        path: "/project-notes",
        description: "Create or update the project note (upsert).",
        body: `{ "project_id": "uuid", "content": "Updated notes", "color": "blue" }`,
        curl: `curl -X PUT -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"project_id":"uuid","content":"Updated notes","color":"blue"}' \\\n  ${BASE_URL}/project-notes`,
        response: `{ "project_id": "uuid", "content": "Updated notes", "color": "blue", ... }`,
      },
    ],
  },
  {
    title: "Time Entries",
    endpoints: [
      {
        method: "POST",
        path: "/time",
        description: "Log time spent on a task (in minutes).",
        body: `{ "task_id": "uuid", "minutes": 30 }`,
        curl: `curl -X POST -H "x-api-key: ak_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"task_id":"uuid","minutes":30}' \\\n  ${BASE_URL}/time`,
        response: `{ "id": "uuid", "task_id": "uuid", "minutes": 30, ... }`,
      },
    ],
  },
];

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <Badge className={cn("rounded-sm font-mono text-xs px-2 py-0.5 min-w-[60px] justify-center", methodColors[endpoint.method])}>
          {endpoint.method}
        </Badge>
        <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
        <span className="text-sm text-muted-foreground ml-auto hidden sm:inline">{endpoint.description}</span>
      </button>
      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/20">
          <p className="text-sm text-muted-foreground sm:hidden">{endpoint.description}</p>
          {endpoint.queryParams && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Query Parameters</h4>
              <code className="text-sm font-mono">{endpoint.queryParams}</code>
            </div>
          )}
          {endpoint.body && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Request Body</h4>
              <CodeBlock code={endpoint.body} language="json" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Example Request</h4>
            <CodeBlock code={endpoint.curl} />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Example Response</h4>
            <CodeBlock code={endpoint.response} language="json" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Agent API Reference</h1>
          </div>
          <p className="text-muted-foreground">Interactive documentation for the Agntive REST API</p>
        </div>
      </header>

      <main className="container max-w-4xl py-8 space-y-10">
        {/* Base URL */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Base URL</h3>
            <div className="flex items-center gap-2 bg-muted rounded-md px-4 py-2.5 font-mono text-sm">
              <span className="truncate">{BASE_URL}</span>
              <CopyButton text={BASE_URL} />
            </div>
          </CardContent>
        </Card>

        {/* Quickstart */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Quickstart</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm text-foreground">
                <li><strong>Sign up</strong> — Create a user account (email/password via the app or Supabase auth).</li>
                <li><strong>Join a team</strong> — Get invited to a team by an existing team owner.</li>
                <li><strong>Generate an API key</strong> — Use a JWT or existing key to call <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">POST /keys</code>. Save the returned key — it's shown only once.</li>
                <li><strong>Make your first call:</strong></li>
              </ol>
              <CodeBlock
                code={`curl -H "x-api-key: ak_YOUR_KEY" \\\n  ${BASE_URL}/projects`}
              />
            </CardContent>
          </Card>
        </section>

        {/* Authentication */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Authentication</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <p>Every request must include one of:</p>
              <ul className="list-disc list-inside space-y-1.5 text-foreground">
                <li><code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">x-api-key: ak_xxx</code> — API key header (recommended for agents)</li>
                <li><code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">Authorization: Bearer &lt;jwt&gt;</code> — Supabase JWT token</li>
              </ul>
              <p className="text-muted-foreground">
                API keys are scoped to the user who created them. The key inherits all team memberships and project access of that user.
                Keys are hashed server-side — the raw key is returned only once at creation.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Endpoints</h2>
          <div className="space-y-8">
            {endpointGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-lg font-medium text-foreground mb-3">{group.title}</h3>
                <div className="space-y-2">
                  {group.endpoints.map((ep, i) => (
                    <EndpointCard key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
