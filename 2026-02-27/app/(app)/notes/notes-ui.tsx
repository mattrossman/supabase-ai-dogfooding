"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "./_components/page-header";
import { triggerEmbedding } from "./actions";

type Note = { id: number; content: string };

export function NotesUI({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const saveNote = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setSaving(false);
      return;
    }

    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({ user_id: user.id, content: content.trim() })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setNotes((prev) => [{ id: note.id, content: content.trim() }, ...prev]);
    setContent("");

    try {
      await triggerEmbedding(note.id);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to generate search index"
      );
    }

    setSaving(false);
    router.refresh();
  }, [content, supabase, router]);

  const deleteNote = useCallback(
    async (id: number) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      await supabase.from("notes").delete().eq("id", id);
      router.refresh();
    },
    [supabase, router]
  );

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader />

      <main className="px-6 py-8">
        <div className="max-w-[720px] mx-auto space-y-8">
          {/* Compose */}
          <div>
            <textarea
              placeholder="Write a note…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none transition-colors font-body text-charcoal placeholder:text-muted"
            />
            <button
              type="button"
              onClick={saveNote}
              disabled={saving || !content.trim()}
              className="mt-3 px-4 py-2 bg-charcoal text-cream rounded font-display hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {error && (
              <p className="mt-3 text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Recent notes */}
          {notes.length > 0 && (
            <div>
              <h2 className="font-display text-lg text-charcoal mb-3">
                Recent notes
              </h2>
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id} className="group flex items-center gap-2">
                    <Link
                      href={`/notes/${note.id}`}
                      className="flex-1 min-w-0 px-4 py-3 rounded border border-charcoal/10 bg-cream-dark hover:border-charcoal/25 transition-colors"
                    >
                      <p className="text-charcoal text-sm truncate">
                        {note.content}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="shrink-0 p-2 text-muted hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete note"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
