"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function QuestionForm({ boardId }: { boardId: string }) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("questions").insert({
      board_id: boardId,
      content: content.trim(),
      author_name: authorName.trim() || null,
    });

    if (!error) {
      setContent("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What would you like to ask?"
        required
        rows={3}
        className="block w-full resize-none rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-stone-800 disabled:opacity-50"
        >
          {loading ? "Sending…" : submitted ? "Sent!" : "Ask"}
        </button>
      </div>
    </form>
  );
}
