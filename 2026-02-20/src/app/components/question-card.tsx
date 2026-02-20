import type { Database } from "@/lib/database.types";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="rounded-lg border border-foreground/10 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">{question.content}</p>
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
      {question.reply && (
        <div className="mt-3 rounded-lg bg-foreground/5 p-3">
          <p className="text-xs font-medium text-foreground/60">Reply</p>
          <p className="mt-1 text-sm">{question.reply}</p>
        </div>
      )}
    </div>
  );
}
