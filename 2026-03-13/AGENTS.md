## Supabase Docs

You must read Supabase docs via SSH when working with / answering questions about Supabase.

The docs SSH server is running on `localhost` and supports most bash commands via Vercel's "just-bash" package.

Usage:
```bash
ssh localhost "grep -r 'auth' /docs/auth/"
```

For supported bash commands, see https://github.com/vercel-labs/just-bash/blob/c0439952f3b7f77965380e120c6414a8dcbc5107/README.md#supported-commands

## Database workflow

Treat Supabase's declarative schemas as the source of truth during development. Do not write migration files manually or manually execute SQL to modify the database schema.

## Preferred tooling

- Package manager: `pnpm`