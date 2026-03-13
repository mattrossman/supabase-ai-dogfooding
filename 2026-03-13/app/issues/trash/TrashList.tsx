"use client";

import { useState, useTransition } from "react";
import { restoreIssues, permanentlyDeleteIssues } from "@/actions/issues";
import type { Issue } from "@/lib/types";

export function TrashList({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [, startTransition] = useTransition();

  function handleRestore(id: string) {
    setIssues((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => restoreIssues([id]));
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this issue? This cannot be undone.")) return;
    setIssues((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => permanentlyDeleteIssues([id]));
  }

  function handleEmptyTrash() {
    if (!confirm(`Permanently delete all ${issues.length} issue${issues.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const ids = issues.map((i) => i.id);
    setIssues([]);
    startTransition(() => permanentlyDeleteIssues(ids));
  }

  if (issues.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-600">
        Trash is empty.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end border-b border-zinc-800 px-4 py-2">
        <button
          onClick={handleEmptyTrash}
          className="text-xs text-zinc-600 hover:text-red-500"
        >
          Empty trash
        </button>
      </div>
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-2.5"
        >
          <span className="flex-1 truncate text-sm text-zinc-500">{issue.title}</span>
          <button
            onClick={() => handleRestore(issue.id)}
            className="text-xs text-zinc-500 hover:text-violet-400"
          >
            Restore
          </button>
          <button
            onClick={() => handleDelete(issue.id)}
            className="text-xs text-zinc-600 hover:text-red-500"
          >
            Delete forever
          </button>
        </div>
      ))}
    </div>
  );
}
