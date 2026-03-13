"use client";

import { useTransition } from "react";
import { updateIssueStatus } from "@/actions/issues";
import { STATUS_LABELS, STATUS_ORDER, type Issue, type IssueStatus } from "@/lib/types";

const STATUS_ICONS: Record<IssueStatus, string> = {
  backlog: "○",
  todo: "◌",
  in_progress: "◑",
  done: "●",
  canceled: "✗",
};

export function StatusSelect({ issue }: { issue: Issue }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={issue.status}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value as IssueStatus;
        startTransition(() => updateIssueStatus(issue.id, status));
      }}
      className="rounded border border-transparent bg-transparent text-xs text-zinc-400 hover:border-zinc-700 focus:border-zinc-600 focus:outline-none disabled:opacity-50 cursor-pointer"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_ICONS[s]} {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
