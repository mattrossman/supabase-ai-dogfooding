# Notes — Semantic Search

Personal notes app with AI-powered semantic search. Search by meaning, not keywords.

## Setup

1. **Start Supabase** (requires Docker):

   ```bash
   pnpm exec supabase start
   ```

2. **Copy env** from `supabase status -o env` or create `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
   ```

3. **Run migrations** (if not auto-applied):

   ```bash
   pnpm exec supabase db reset
   ```

4. **Start Edge Functions** (in a separate terminal):

   ```bash
   pnpm exec supabase functions serve
   ```

5. **Start the app**:

   ```bash
   pnpm dev
   ```

Open http://localhost:3000. Sign up or use the demo account (demo@example.com / demo123). Write notes, save. Search finds notes by meaning (e.g. "stress at work" → "deadlines piling up").

**Demo account** is seeded on every `supabase db reset`.
