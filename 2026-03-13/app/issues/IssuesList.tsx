"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { updateIssueStatus } from "@/actions/issues";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  PRIORITY_ORDER,
  type Issue,
  type IssueStatus,
  type IssuePriority,
} from "@/lib/types";
import { StatusSelect } from "./StatusSelect";

const STATUS_ICONS: Record<IssueStatus, string> = {
  backlog: "○",
  todo: "◌",
  in_progress: "◑",
  done: "●",
  canceled: "✗",
};

function PriorityIcon({ priority }: { priority: IssuePriority }) {
  if (priority === "no_priority") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-zinc-600" aria-label="No priority">
        <rect x="1" y="7.5" width="2.5" height="1" rx="0.5" fill="currentColor" />
        <rect x="6.75" y="7.5" width="2.5" height="1" rx="0.5" fill="currentColor" />
        <rect x="12.5" y="7.5" width="2.5" height="1" rx="0.5" fill="currentColor" />
      </svg>
    );
  }
  if (priority === "urgent") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-orange-500" aria-label="Urgent">
        <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.15" />
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  const bars: [number, boolean][] = [
    [3.5, priority === "high" || priority === "medium" || priority === "low"],
    [6.5, priority === "high" || priority === "medium"],
    [9.5, priority === "high"],
  ];
  const color =
    priority === "high" ? "text-orange-400" :
    priority === "medium" ? "text-yellow-400" :
    "text-blue-400";
  const heights = [5, 8, 11];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`} aria-label={priority}>
      {[0, 1, 2].map((i) => {
        const h = heights[i];
        const filled = bars[i][1];
        return (
          <rect
            key={i}
            x={3 + i * 4}
            y={15 - h}
            width="3"
            height={h}
            rx="0.5"
            fill="currentColor"
            opacity={filled ? 1 : 0.25}
          />
        );
      })}
    </svg>
  );
}

function IssueRow({
  issue,
  isDragging,
}: {
  issue: Issue;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: issue.id,
    data: { status: issue.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-4 border-b border-zinc-800/50 px-6 py-3 hover:bg-zinc-900/50 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Prevent the select from starting a drag */}
      <div onPointerDown={(e) => e.stopPropagation()}>
        <StatusSelect issue={issue} />
      </div>
      <PriorityIcon priority={issue.priority} />
      <Link
        href={`/issues/${issue.id}`}
        className="flex-1 truncate text-sm hover:text-violet-300"
      >
        {issue.title}
      </Link>
    </div>
  );
}

function StatusGroup({
  status,
  issues,
  activeId,
}: {
  status: IssueStatus;
  issues: Issue[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`transition-colors ${isOver ? "bg-zinc-800/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-6 py-2 text-xs text-zinc-500 sticky top-0 bg-[#0f0f0f] border-b border-zinc-800/50">
        <span>{STATUS_ICONS[status]}</span>
        <span>{STATUS_LABELS[status]}</span>
        <span className="ml-1 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
          {issues.length}
        </span>
      </div>
      <div className="min-h-[4px]">
        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            isDragging={issue.id === activeId}
          />
        ))}
      </div>
    </section>
  );
}

export function IssuesList({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const grouped = STATUS_ORDER.reduce<Record<IssueStatus, Issue[]>>(
    (acc, status) => {
      acc[status] = issues
        .filter((i) => i.status === status)
        .sort((a, b) => {
          const pa = PRIORITY_ORDER.indexOf(a.priority);
          const pb = PRIORITY_ORDER.indexOf(b.priority);
          if (pa !== pb) return pa - pb;
          return a.title.localeCompare(b.title);
        });
      return acc;
    },
    {} as Record<IssueStatus, Issue[]>
  );

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;
    const currentStatus = active.data.current?.status as IssueStatus;

    if (newStatus === currentStatus) return;
    if (!STATUS_ORDER.includes(newStatus)) return;

    // Optimistic update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    startTransition(() => updateIssueStatus(issueId, newStatus));
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {STATUS_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;
        return (
          <StatusGroup
            key={status}
            status={status}
            issues={group}
            activeId={activeId}
          />
        );
      })}

      <DragOverlay dropAnimation={null}>
        {activeIssue ? (
          <div className="flex items-center gap-4 border border-zinc-700 rounded bg-zinc-900 px-6 py-3 shadow-lg opacity-90 text-sm">
            <span className="text-zinc-400 text-xs">
              {STATUS_ICONS[activeIssue.status]}
            </span>
            <span className="flex-1 truncate">{activeIssue.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
