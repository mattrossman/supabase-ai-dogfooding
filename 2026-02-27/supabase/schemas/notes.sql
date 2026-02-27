create extension if not exists vector with schema extensions;

create table if not exists public.notes (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  embedding extensions.vector(384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users select own notes"
  on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own notes"
  on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own notes"
  on public.notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own notes"
  on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists notes_embedding_idx
  on public.notes using hnsw (embedding extensions.vector_ip_ops);

create or replace function public.match_notes(
  query_embedding extensions.vector(384),
  match_threshold float default 0.7,
  match_count int default 10
)
returns setof public.notes
language sql
security invoker
as $$
  select *
  from public.notes
  where embedding is not null
    and (select auth.uid()) = user_id
    and embedding <#> query_embedding < -match_threshold
  order by embedding <#> query_embedding
  limit least(match_count, 50);
$$;
