create or replace function update_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy "authenticated delete" on "public"."issues";

drop policy "authenticated insert" on "public"."issues";

drop policy "authenticated read" on "public"."issues";

drop policy "authenticated update" on "public"."issues";


  create policy "authenticated delete"
  on "public"."issues"
  as permissive
  for delete
  to public
using ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "authenticated insert"
  on "public"."issues"
  as permissive
  for insert
  to public
with check ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "authenticated read"
  on "public"."issues"
  as permissive
  for select
  to public
using ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "authenticated update"
  on "public"."issues"
  as permissive
  for update
  to public
using ((( SELECT auth.role() AS role) = 'authenticated'::text));



