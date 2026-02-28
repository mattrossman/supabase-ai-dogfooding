"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "./_components/page-header";
import { triggerEmbedding } from "./actions";

type Note = { id: number; content: string; created_at?: string };

export function NotesUI({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [composing, setComposing] = useState(false);
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
      .select("id, created_at")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setNotes((prev) => [{ id: note.id, content: content.trim(), created_at: note.created_at }, ...prev]);
    setContent("");
    setComposing(false);

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

  const closeComposer = () => {
    setComposing(false);
    setContent("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader />

      {/* Compose modal */}
      {composing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeComposer(); }}
        >
          <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" aria-hidden />
          <div className="relative w-full max-w-lg bg-cream rounded-lg border border-charcoal/15 shadow-xl p-6">
            <textarea
              autoFocus
              placeholder="Write a note…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) {
                  e.preventDefault();
                  saveNote();
                }
                if (e.key === "Escape") closeComposer();
              }}
              rows={6}
              className="w-full px-4 py-3 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none transition-colors font-body text-charcoal placeholder:text-muted"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={saveNote}
                disabled={saving || !content.trim()}
                className="px-4 py-2 bg-charcoal text-cream rounded font-display hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <span className="text-muted text-xs">⌘↵ to save · Esc to cancel</span>
            </div>
            {error && (
              <p className="mt-3 text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      <main className="px-6 py-8">
        <div className="max-w-[720px] mx-auto space-y-8">
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="px-4 py-2 bg-charcoal text-cream rounded font-display hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
          >
            New note
          </button>

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
                      {note.created_at && (
                        <p className="text-muted text-xs mt-1">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      )}
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
