import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { deleteNote } from "../actions";
import { PageHeader } from "../_components/page-header";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noteId = parseInt(id, 10);
  if (isNaN(noteId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: note } = await supabase
    .from("notes")
    .select("id, content, created_at")
    .eq("id", noteId)
    .single();

  if (!note) notFound();

  const deleteThisNote = deleteNote.bind(null, noteId);

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader />

      <main className="px-6 py-8">
        <div className="max-w-[720px] mx-auto">
          <Link
            href="/notes"
            className="text-sm text-muted hover:text-charcoal transition-colors"
          >
            ← Back
          </Link>

          <div className="mt-6 px-6 py-6 rounded border border-charcoal/10 bg-cream-dark">
            <p className="text-charcoal font-body whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
            <p className="mt-4 text-xs text-muted">
              {new Date(note.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <form action={deleteThisNote} className="mt-4">
            <button
              type="submit"
              className="text-sm text-muted hover:text-red-600 transition-colors"
            >
              Delete note
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
