import type { Database } from "@/lib/database.types";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="border-b border-stone-200 py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
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
      <p className="mt-2 text-xs text-stone-400">
        {question.author_name || "Anonymous"} &middot;{" "}
        {new Date(question.created_at).toLocaleString()}
      </p>
      {question.reply && (
        <div className="mt-3 border-l-2 border-amber-400 pl-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Reply
          </p>
          <p className="mt-1 text-sm text-stone-700">{question.reply}</p>
        </div>
      )}
    </div>
  );
}
