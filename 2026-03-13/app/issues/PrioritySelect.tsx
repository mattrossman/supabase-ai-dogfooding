"use client";

import { useTransition } from "react";
import { updateIssuePriority } from "@/actions/issues";
import { PRIORITY_LABELS, type Issue, type IssuePriority } from "@/lib/types";

const PRIORITY_ORDER: IssuePriority[] = [
  "no_priority",
  "urgent",
  "high",
  "medium",
  "low",
];

export function PrioritySelect({ issue }: { issue: Issue }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={issue.priority}
      disabled={isPending}
      onChange={(e) => {
        const priority = e.target.value as IssuePriority;
        startTransition(() => updateIssuePriority(issue.id, priority));
      }}
      className="rounded border border-transparent bg-transparent text-xs text-zinc-400 hover:border-zinc-700 focus:border-zinc-600 focus:outline-none disabled:opacity-50 cursor-pointer"
    >
      {PRIORITY_ORDER.map((p) => (
        <option key={p} value={p}>
          {PRIORITY_LABELS[p]}
        </option>
      ))}
    </select>
  );
}
