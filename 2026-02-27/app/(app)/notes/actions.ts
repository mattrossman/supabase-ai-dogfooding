"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function searchNotes(query: string): Promise<{ id: number; content: string }[]> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query.trim() }),
    }
  );
  const json = await res.json();
  return json.results ?? [];
}

export async function triggerEmbedding(noteId: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embedding`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ note_id: noteId }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Embedding failed: ${res.status}`);
  }
}

export async function backfillEmbeddings(): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, count: 0, error: "Not authenticated" };

  const { data: notes } = await supabase
    .from("notes")
    .select("id")
    .is("embedding", null);
  if (!notes?.length) return { ok: true, count: 0 };

  let ok = true;
  for (const { id } of notes) {
    try {
      await triggerEmbedding(id);
    } catch {
      ok = false;
    }
  }
  return { ok, count: notes.length };
}

export async function deleteNote(id: number): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notes").delete().eq("id", id);
  redirect("/notes");
}
