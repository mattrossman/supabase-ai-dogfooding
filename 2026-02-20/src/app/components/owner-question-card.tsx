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
    <div className="border-b border-stone-200 py-4 last:border-0">
      <div className="flex items-start gap-3">
        {dragHandleProps && (
          <button
            ref={dragHandleRef}
            className="mt-0.5 shrink-0 cursor-grab touch-none text-stone-300 transition-colors hover:text-stone-500"
            {...dragHandleProps}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-relaxed text-stone-800">
              {question.content}
            </p>
            <div className="flex shrink-0 gap-1.5">
              {question.is_pinned && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Pinned
                </span>
              )}
              {question.is_answered && (
                <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Answered
                </span>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-xs text-stone-400">
            {question.author_name || "Anonymous"} &middot;{" "}
            {new Date(question.created_at).toLocaleString()}
          </p>

          {question.reply && !isReplying && (
            <div className="mt-3 border-l-2 border-amber-400 pl-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Your reply
              </p>
              <p className="mt-1 text-sm text-stone-700">{question.reply}</p>
            </div>
          )}

          {isReplying && (
            <form onSubmit={handleReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-stone-800 disabled:opacity-50"
              >
                {loading ? "…" : "Send"}
              </button>
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-50"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-medium text-stone-500 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {question.reply ? "Edit reply" : "Reply"}
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={handleTogglePin}
              className="text-xs font-medium text-stone-500 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {question.is_pinned ? "Unpin" : "Pin"}
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={handleToggleAnswered}
              className="text-xs font-medium text-stone-500 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {question.is_answered ? "Mark unanswered" : "Mark answered"}
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={handleDelete}
              className="text-xs font-medium text-red-500 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
