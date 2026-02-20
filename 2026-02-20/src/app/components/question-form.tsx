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
        placeholder="Ask a question..."
        required
        rows={3}
        className="block w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none resize-none"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          className="flex-1 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Sending..." : submitted ? "Sent!" : "Ask"}
        </button>
      </div>
    </form>
  );
}
