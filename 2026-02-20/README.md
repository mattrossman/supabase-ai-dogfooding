# AskBoard — Anonymous Q&A

Create anonymous Q&A boards and share them with your audience. Visitors ask questions without signing up. Board owners reply, pin favourites, and mark questions as answered — all updating in real time.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Node.js >= 20
- pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local Supabase (requires Docker)
npx supabase start

# Start the dev server
pnpm dev
```

The app runs at **http://localhost:3000**.

## Testing the Full Flow

### 1. Create an account

Go to http://localhost:3000/login and sign up:

- **Email:** `owner@test.com`
- **Password:** `password123`

No email confirmation needed in local dev — you'll be redirected to the dashboard immediately.

### 2. Create a board

On the dashboard, type a title and click **Create Board**:

- **Title:** `AMA with the team`

You'll see the board appear with a copyable public link (e.g. `/board/ama-with-the-team-a1b2`).

### 3. Submit anonymous questions

Open the public board link in an **incognito/private window** (so you're not logged in):

```
http://localhost:3000/board/ama-with-the-team-a1b2
```

> Replace the slug with your actual board slug shown on the dashboard.

Submit a few questions:

| Question | Name (optional) |
|---|---|
| What's the roadmap for Q3? | Alice |
| How do you handle on-call rotations? | *(leave blank)* |
| Any plans to open-source the SDK? | Bob |

Each question should appear **instantly** on both the public page and the owner's dashboard view (realtime).

### 4. Manage questions as the owner

Go back to your logged-in window and open the board from the dashboard (click the board title). You can:

- **Reply** — click Reply, type a response (e.g. `We're focusing on performance and new integrations`), and send. The reply appears live on the public page.
- **Pin** — click Pin on a question to move it to the top.
- **Mark Answered** — click Mark Answered to add a green "Answered" badge.
- **Delete** — remove a question entirely.

### 5. Verify real-time updates

Keep both windows open side-by-side:

1. Submit a new question from the incognito window → it appears on the owner view
2. Reply to a question from the owner view → the reply appears on the public page
3. Pin a question → it moves to the top on both views

## Agent Skills

This project uses the following Claude Code agent skills:

- **next-best-practices** — sourced from https://github.com/vercel-labs/next-skills

## Supabase Studio

Browse your local database at http://127.0.0.1:54323.

## Stopping

```bash
npx supabase stop
```
