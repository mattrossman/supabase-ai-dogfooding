import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotesUI } from "./notes-ui";

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notes } = await supabase
    .from("notes")
    .select("id, content")
    .order("created_at", { ascending: false })
    .limit(50);

  return <NotesUI initialNotes={notes ?? []} />;
}
