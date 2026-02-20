-- Tables

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  content text not null,
  author_name text,
  is_pinned boolean not null default false,
  is_answered boolean not null default false,
  reply text,
  created_at timestamptz not null default now()
);

create index idx_questions_board_id on public.questions(board_id);
create index idx_boards_slug on public.boards(slug);

-- RLS

alter table public.boards enable row level security;
alter table public.questions enable row level security;

-- boards policies

create policy "Anyone can view boards"
  on public.boards for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can create boards"
  on public.boards for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their boards"
  on public.boards for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their boards"
  on public.boards for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- questions policies

create policy "Anyone can view questions"
  on public.questions for select
  to anon, authenticated
  using (true);

create policy "Anyone can submit questions"
  on public.questions for insert
  to anon, authenticated
  with check (true);

create policy "Board owner can update questions"
  on public.questions for update
  to authenticated
  using (
    board_id in (select id from public.boards where owner_id = (select auth.uid()))
  )
  with check (
    board_id in (select id from public.boards where owner_id = (select auth.uid()))
  );

create policy "Board owner can delete questions"
  on public.questions for delete
  to authenticated
  using (
    board_id in (select id from public.boards where owner_id = (select auth.uid()))
  );

-- Realtime

alter publication supabase_realtime add table public.questions;
