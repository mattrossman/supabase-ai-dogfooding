create type issue_status as enum ('backlog', 'todo', 'in_progress', 'done', 'canceled');
create type issue_priority as enum ('no_priority', 'urgent', 'high', 'medium', 'low');

create table issues (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      issue_status not null default 'backlog',
  priority    issue_priority not null default 'no_priority',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger issues_updated_at
  before update on issues
  for each row execute function update_updated_at();

alter table issues enable row level security;

create policy "authenticated read" on issues for select
  using (auth.role() = 'authenticated');

create policy "authenticated insert" on issues for insert
  with check (auth.role() = 'authenticated');

create policy "authenticated update" on issues for update
  using (auth.role() = 'authenticated');

create policy "authenticated delete" on issues for delete
  using (auth.role() = 'authenticated');
