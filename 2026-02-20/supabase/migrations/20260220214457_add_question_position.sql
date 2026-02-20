-- Add position column for manual ordering within groups.
alter table public.questions
  add column position integer not null default 0;

-- Backfill: assign positions based on created_at within each group.
with ranked as (
  select
    id,
    row_number() over (
      partition by board_id, is_pinned, is_answered
      order by created_at desc
    ) as rn
  from public.questions
)
update public.questions q
set position = ranked.rn
from ranked
where q.id = ranked.id;

-- Trigger: auto-assign position on insert (bottom of group).
create or replace function public.set_question_default_position()
returns trigger
language plpgsql
as $$
begin
  NEW.position := coalesce(
    (select max(position) + 1
     from public.questions
     where board_id = NEW.board_id
       and is_pinned = NEW.is_pinned
       and is_answered = NEW.is_answered),
    1
  );
  return NEW;
end;
$$;

create trigger trg_set_question_position
  before insert on public.questions
  for each row
  execute function public.set_question_default_position();

-- RPC: batch-update positions in a single transaction.
-- Runs as SECURITY INVOKER so RLS update policy (owner-only) is enforced.
create or replace function public.reorder_questions(payload jsonb)
returns void
language plpgsql
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(payload)
  loop
    update public.questions
    set position = (item ->> 'position')::integer
    where id = (item ->> 'id')::uuid;
  end loop;
end;
$$;
