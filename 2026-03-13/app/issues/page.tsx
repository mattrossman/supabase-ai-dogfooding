import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_ORDER,
  type Issue,
  type IssueStatus,
} from "@/lib/types";
import { StatusSelect } from "./StatusSelect";

const STATUS_ICONS: Record<IssueStatus, string> = {
  backlog: "○",
  todo: "◌",
  in_progress: "◑",
  done: "●",
  canceled: "✗",
};

const PRIORITY_ICONS: Record<string, string> = {
  no_priority: "—",
  urgent: "!!",
  high: "↑",
  medium: "→",
  low: "↓",
};

export default async function IssuesPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

  const grouped = STATUS_ORDER.reduce<Record<IssueStatus, Issue[]>>(
    (acc, status) => {
      acc[status] = (issues ?? []).filter((i) => i.status === status);
      return acc;
    },
    {} as Record<IssueStatus, Issue[]>
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-sm font-medium">Issues</h1>
        <Link
          href="/issues/new"
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium hover:bg-violet-500"
        >
          New Issue
        </Link>
      </header>

      <div className="flex-1 overflow-auto">
        {STATUS_ORDER.map((status) => {
          const group = grouped[status];
          if (group.length === 0) return null;
          return (
            <section key={status}>
              <div className="flex items-center gap-2 px-6 py-2 text-xs text-zinc-500 sticky top-0 bg-[#0f0f0f] border-b border-zinc-800/50">
                <span>{STATUS_ICONS[status]}</span>
                <span>{STATUS_LABELS[status]}</span>
                <span className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                  {group.length}
                </span>
              </div>
              {group.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-4 border-b border-zinc-800/50 px-6 py-3 hover:bg-zinc-900/50"
                >
                  <StatusSelect issue={issue} />
                  <Link
                    href={`/issues/${issue.id}`}
                    className="flex-1 truncate text-sm hover:text-violet-300"
                  >
                    {issue.title}
                  </Link>
                  <span className="text-xs text-zinc-600" title={PRIORITY_LABELS[issue.priority]}>
                    {PRIORITY_ICONS[issue.priority]}
                  </span>
                </div>
              ))}
            </section>
          );
        })}

        {(!issues || issues.length === 0) && (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-600">
            No issues yet.{" "}
            <Link href="/issues/new" className="ml-1 text-violet-400 hover:text-violet-300">
              Create one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
