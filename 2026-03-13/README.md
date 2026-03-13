## Prerequisites

- Node.js 20+
- pnpm
- Docker (for Supabase local stack)
- Running docs SSH server: https://github.com/supabase/supabase/tree/feat/docs-over-ssh/apps/docs/ssh-server

## Development

**1. Install dependencies**

```bash
pnpm install
```

**2. Start Supabase**

```bash
pnpm supabase start
```

**3. Apply the schema**

```bash
pnpm supabase db reset
```

**4. Seed the database**

```bash
pnpm db:seed
```

This creates a demo user and 15 sample issues.

**5. Start the dev server**

```bash
pnpm dev
```

Open http://localhost:3000 and sign in with:

- **Email:** `demo@example.com`
- **Password:** `password`

## Local tools

| Tool | URL |
|------|-----|
| App | http://localhost:3000 |
| Supabase Studio | http://localhost:54323 |
| Mailpit (email) | http://localhost:54324 |
