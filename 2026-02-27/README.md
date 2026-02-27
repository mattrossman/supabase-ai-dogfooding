# Notes — Semantic Search

Personal notes app with AI-powered semantic search. Search by meaning, not keywords.

## Setup

1. **Start Supabase** (requires Docker):

   ```bash
   pnpm supabase start
   ```

2. **Create `.env.local`** with values from `supabase status`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key from supabase status>
   ```

3. **Start Edge Functions** (in a separate terminal):

   ```bash
   pnpm supabase functions serve
   ```

4. **Start the app**:

   ```bash
   pnpm dev
   ```

> To reset the database and reseed: `pnpm supabase db reset`

**MCP:** `.mcp.json` and `.cursor/mcp.json` configure Supabase local + Next.js dev MCP. Requires `supabase start` and `pnpm dev` running.

Open http://localhost:3000. Sign up or use the demo account (demo@example.com / demo123). Write notes, save. Search navigates to `/notes/search` and finds notes by meaning (e.g. "stress at work" → "deadlines piling up").

**Demo account** is seeded on every `supabase db reset`.
