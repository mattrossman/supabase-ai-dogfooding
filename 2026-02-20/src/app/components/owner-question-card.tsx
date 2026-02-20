"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function OwnerQuestionCard({
  question,
  onDelete,
  dragHandleProps,
  dragHandleRef,
}: {
  question: Question;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
  dragHandleRef?: (node: HTMLElement | null) => void;
}) {
  const [replyText, setReplyText] = useState(question.reply ?? "");
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleTogglePin() {
    await supabase
      .from("questions")
      .update({ is_pinned: !question.is_pinned, position: 0 })
      .eq("id", question.id);
  }

  async function handleToggleAnswered() {
    await supabase
      .from("questions")
      .update({ is_answered: !question.is_answered, position: 0 })
      .eq("id", question.id);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    await supabase
      .from("questions")
      .update({ reply: replyText.trim(), is_answered: true, position: 0 })
      .eq("id", question.id);
    setLoading(false);
    setIsReplying(false);
  }

  async function handleDelete() {
    await supabase.from("questions").delete().eq("id", question.id);
    onDelete(question.id);
  }

  return (
    <div className="rounded-lg border border-foreground/10 p-4">
      <div className="flex items-start justify-between gap-2">
        {dragHandleProps && (
          <button
            ref={dragHandleRef}
            className="cursor-grab shrink-0 touch-none text-foreground/30 hover:text-foreground/60 mt-0.5"
            {...dragHandleProps}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>
        )}
        <p className="text-sm flex-1">{question.content}</p>
        <div className="flex shrink-0 gap-1">
          {question.is_pinned && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Pinned
            </span>
          )}
          {question.is_answered && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Answered
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-foreground/50">
        {question.author_name || "Anonymous"} &middot;{" "}
        {new Date(question.created_at).toLocaleString()}
      </p>

      {question.reply && !isReplying && (
        <div className="mt-3 rounded-lg bg-foreground/5 p-3">
          <p className="text-xs font-medium text-foreground/60">Your reply</p>
          <p className="mt-1 text-sm">{question.reply}</p>
        </div>
      )}

      {isReplying && (
        <form onSubmit={handleReply} className="mt-3 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-lg border border-foreground/20 bg-background px-3 py-1.5 text-sm focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
          <button
            type="button"
            onClick={() => setIsReplying(false)}
            className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="rounded border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5 transition-colors"
        >
          {question.reply ? "Edit Reply" : "Reply"}
        </button>
        <button
          onClick={handleTogglePin}
          className="rounded border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5 transition-colors"
        >
          {question.is_pinned ? "Unpin" : "Pin"}
        </button>
        <button
          onClick={handleToggleAnswered}
          className="rounded border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5 transition-colors"
        >
          {question.is_answered ? "Mark Unanswered" : "Mark Answered"}
        </button>
        <button
          onClick={handleDelete}
          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
