<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Screaming architecture

The top-level layout must say what the app does (an authenticated chat over a LangGraph agent), not which framework it uses. Code is grouped by business feature under `features/`, not by technical type. Do not recreate top-level `lib/`, `components/`, or `hooks/`.

```
app/                    Next.js routing only. Thin pages, layouts, route handlers.
features/
  auth/                 Better Auth config, client, session guards, login UI
  agent/                Deep agent, OpenRouter models, tools, Postgres checkpointer
  threads/              Thread runtime (registry, stream session, serialization),
                        ownership repository, browser thread API
  chat/                 Chat UI: conversation, messages, tool calls, reasoning,
                        subagents, thread history sidebar
shared/
  ui/                   shadcn components and `icons.tsx` (generated, do not hand-edit)
  ai-elements/          ai-elements components (generated, do not hand-edit)
  db/                   Postgres pool and Drizzle client (no tables)
  hooks/                Feature-agnostic hooks (e.g. `use-mobile`)
  lib/                  Feature-agnostic helpers (e.g. `cn` in `utils.ts`)
scripts/                CLI runner and tasks
```

## Feature folder layout

Each feature owns everything it needs. Use only the parts a feature actually has:

```
features/<feature>/
  index.ts              Client-safe public entry: components, browser helpers, types
  server/index.ts       Server-only public entry (`import "server-only"`)
  server/               Server-only implementation
  db/schema.ts          Drizzle tables owned by this feature
  components/           React components
  hooks/                Client hooks
  client.ts             Browser-side API
```

## Rules

- `app/` routes stay thin: parse the request, call into a feature, return the response. No business logic, queries, or agent calls inline.
- Outside a feature, import only its entry points: `@/features/<f>` (client-safe), `@/features/<f>/server` (server-only), or `features/<f>/db/schema` (tables). Never deep-import implementation files. Inside a feature, use relative imports.
- Never export server code (database, Better Auth server, agent) from a feature's `index.ts`; client components import it. Types may be re-exported with `export type`.
- Every file under `features/*/server/` starts with `import "server-only"`. The exception is `shared/db/index.ts`: `scripts/` load it through `tsx`, where `server-only` throws. Reach it only through feature `server/` code.
- Read `process.env` only in `features/*/server/`, `shared/db/`, and root config files. Never in components, hooks, `client.ts`, or `app/`.
- Server entry points return minimal plain objects. Never pass raw DB rows, session objects, or agent state to client components; pick the fields the UI needs (e.g. `{ name, email }`).
- Server Components call `@/features/<f>/server` directly. Route handlers under `app/api/` exist for client components and streaming, not for server-side fetches.
- Server Actions, if added, live in `features/<f>/server/actions.ts` with `"use server"`, re-authorize with `requireUser()`, and delegate to the feature's server code.
- Do not colocate code in `app/` (no `_components` or `_lib` private folders). Put it in a feature.
- Schema files must not import `@/` aliases or anything that loads `server-only`, because Drizzle Kit loads them directly. Reference another feature's table with a relative path to its `db/schema.ts`.
- Dependency direction is `app` → `features` → `shared`. `shared/` never imports from `features/`. Allowed feature edges: `chat` → `threads`, `chat` → `agent` (types only), `threads` → `agent`, and any feature → `auth`. No cycles.
- A table belongs to the feature that owns the data. `drizzle.config.ts` picks up every `features/*/db/schema.ts`.
- shadcn and ai-elements components go into `shared/ui/` and `shared/ai-elements/` through the CLI; `components.json` aliases point there.
- Name new folders after the domain concept (`threads`, `billing`), not the mechanism (`api`, `utils`, `services`).
- When a new capability doesn't fit an existing feature, create a new feature folder rather than growing `shared/`.
