"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { searchNotes, triggerEmbedding } from "./actions";

type Note = { id: number; content: string };

export function NotesUI({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Note[] | null>(null);
  const [searching, setSearching] = useState(false);
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
    setSaving(false);
    triggerEmbedding(note.id);
    router.refresh();
  }, [content, supabase, router]);

  const search = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      setSearching(false);
      return;
    }
    const data = await searchNotes(searchQuery.trim());
    setResults(data);
    setSearching(false);
  }, [searchQuery, supabase, router]);

  const deleteNote = useCallback(async (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
    router.refresh();
  }, [supabase, router]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-charcoal/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl text-charcoal">Notes</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search by meaning…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              className="w-64 px-3 py-2 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={search}
              disabled={searching}
              className="px-3 py-2 border border-charcoal/20 rounded bg-cream-dark hover:bg-charcoal/5 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-colors"
              aria-label="Search"
            >
              {searching ? "…" : <SearchIcon />}
            </button>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-muted hover:text-charcoal transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-6">
        <div className="max-w-[720px] mx-auto">
          <textarea
            placeholder="Write a note…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none transition-colors font-body text-charcoal placeholder:text-muted"
          />
          <button
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

        {notes.length > 0 && (
          <div className="max-w-[720px] mx-auto mt-8">
            <h2 className="font-display text-lg text-charcoal mb-4">
              Your notes
            </h2>
            <ul className="space-y-3">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="p-4 rounded border border-charcoal/10 bg-cream-dark flex justify-between gap-4"
                >
                  <p className="text-charcoal whitespace-pre-wrap flex-1 min-w-0">{note.content}</p>
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="shrink-0 p-1 text-muted hover:text-red-600 transition-colors"
                    aria-label="Delete note"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results !== null && (
          <div className="max-w-[720px] mx-auto mt-12">
            <h2 className="font-display text-lg text-charcoal mb-4">
              Search results
            </h2>
            {results.length === 0 ? (
              <p className="text-muted">No matching notes. Add notes and wait a moment for embeddings to generate.</p>
            ) : (
            <ul className="space-y-3">
              {results.map((note, i) => (
                <li
                  key={note.id}
                  className="p-4 rounded border border-charcoal/10 bg-cream-dark"
                  style={{
                    animation: "fadeSlideIn 0.3s ease-out forwards",
                    animationDelay: `${i * 50}ms`,
                    opacity: 0,
                  }}
                >
                  <p className="text-charcoal whitespace-pre-wrap">{note.content}</p>
                </li>
              ))}
            </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function SearchIcon() {
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
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
