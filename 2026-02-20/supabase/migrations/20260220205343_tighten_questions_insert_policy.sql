-- Replace permissive insert policy with one that prevents
-- anonymous users from setting owner-only fields.

drop policy "Anyone can submit questions" on public.questions;

create policy "Anyone can submit questions"
  on public.questions for insert
  to anon, authenticated
  with check (
    is_pinned = false
    and is_answered = false
    and reply is null
  );
