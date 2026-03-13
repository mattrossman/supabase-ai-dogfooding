create type "public"."issue_priority" as enum ('no_priority', 'urgent', 'high', 'medium', 'low');

create type "public"."issue_status" as enum ('backlog', 'todo', 'in_progress', 'done', 'canceled');


  create table "public"."issues" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "status" public.issue_status not null default 'backlog'::public.issue_status,
    "priority" public.issue_priority not null default 'no_priority'::public.issue_priority,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."issues" enable row level security;

CREATE UNIQUE INDEX issues_pkey ON public.issues USING btree (id);

alter table "public"."issues" add constraint "issues_pkey" PRIMARY KEY using index "issues_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."issues" to "anon";

grant insert on table "public"."issues" to "anon";

grant references on table "public"."issues" to "anon";

grant select on table "public"."issues" to "anon";

grant trigger on table "public"."issues" to "anon";

grant truncate on table "public"."issues" to "anon";

grant update on table "public"."issues" to "anon";

grant delete on table "public"."issues" to "authenticated";

grant insert on table "public"."issues" to "authenticated";

grant references on table "public"."issues" to "authenticated";

grant select on table "public"."issues" to "authenticated";

grant trigger on table "public"."issues" to "authenticated";

grant truncate on table "public"."issues" to "authenticated";

grant update on table "public"."issues" to "authenticated";

grant delete on table "public"."issues" to "service_role";

grant insert on table "public"."issues" to "service_role";

grant references on table "public"."issues" to "service_role";

grant select on table "public"."issues" to "service_role";

grant trigger on table "public"."issues" to "service_role";

grant truncate on table "public"."issues" to "service_role";

grant update on table "public"."issues" to "service_role";


  create policy "authenticated delete"
  on "public"."issues"
  as permissive
  for delete
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "authenticated insert"
  on "public"."issues"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "authenticated read"
  on "public"."issues"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "authenticated update"
  on "public"."issues"
  as permissive
  for update
  to public
using ((auth.role() = 'authenticated'::text));


CREATE TRIGGER issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


