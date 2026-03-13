"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { updateIssueStatus, deleteIssues } from "@/actions/issues";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  PRIORITY_ORDER,
  type Issue,
  type IssueStatus,
  type IssuePriority,
} from "@/lib/types";

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

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      {checked ? (
        <>
          <rect x="1" y="1" width="14" height="14" rx="3" fill="#6d28d9" />
          <path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="#52525b" strokeWidth="1" />
      )}
    </svg>
  );
}

function IssueRow({
  issue,
  isDragging,
  isSelected,
  anySelected,
  onSelect,
}: {
  issue: Issue;
  isDragging?: boolean;
  isSelected: boolean;
  anySelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: issue.id,
    data: { status: issue.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-3 border-b border-zinc-800/50 px-4 py-2.5 cursor-default select-none ${
        isSelected ? "bg-violet-950/30" : "hover:bg-zinc-900/50"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Checkbox — hidden until hover, selected, or this row is being dragged */}
      <div
        className={`w-4 shrink-0 ${isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onSelect}
      >
        <Checkbox checked={isSelected} />
      </div>

      <PriorityIcon priority={issue.priority} />
      <span className="text-xs text-zinc-600 shrink-0">{STATUS_ICONS[issue.status]}</span>

      <Link
        href={`/issues/${issue.id}`}
        className="flex-1 truncate text-sm hover:text-violet-300 cursor-default select-none"
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
  selectedIds,
  anySelected,
  onSelect,
}: {
  status: IssueStatus;
  issues: Issue[];
  activeId: string | null;
  selectedIds: Set<string>;
  anySelected: boolean;
  onSelect: (issue: Issue, e: React.MouseEvent) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`transition-colors ${isOver ? "bg-zinc-800/30" : ""}`}
    >
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500 sticky top-0 bg-[#0f0f0f] border-b border-zinc-800/50">
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
            isSelected={selectedIds.has(issue.id)}
            anySelected={anySelected}
            onSelect={(e) => onSelect(issue, e)}
          />
        ))}
      </div>
    </section>
  );
}

export function IssuesList({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedId = useRef<string | null>(null);
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

  // Flat ordered list for range selection
  const flatIssues = STATUS_ORDER.flatMap((s) => grouped[s] ?? []);

  const handleSelect = useCallback((issue: Issue, e: React.MouseEvent) => {
    e.preventDefault();
    const id = issue.id;

    if (e.shiftKey && lastSelectedId.current) {
      // Range select between lastSelected and this one
      const ids = flatIssues.map((i) => i.id);
      const from = ids.indexOf(lastSelectedId.current);
      const to = ids.indexOf(id);
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from];
        const rangeIds = ids.slice(start, end + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((rid) => next.add(rid));
          return next;
        });
      }
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastSelectedId.current = id;
    }
  }, [flatIssues]);

  // Cmd+Delete / Cmd+Backspace to batch delete selected
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.metaKey) return;
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (selectedIds.size === 0) return;

      e.preventDefault();
      const ids = Array.from(selectedIds);

      // Optimistic removal
      setIssues((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      lastSelectedId.current = null;

      startTransition(() => deleteIssues(ids));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds]);

  // Force default cursor globally while dragging (prevents I-beam over text)
  useEffect(() => {
    if (!activeId) return;
    const style = document.createElement("style");
    style.textContent = "* { cursor: default !important; }";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [activeId]);

  // Escape to deselect all
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedIds.size > 0) {
        setSelectedIds(new Set());
        lastSelectedId.current = null;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds]);

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;
  const anySelected = selectedIds.size > 0;

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

    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    startTransition(() => updateIssueStatus(issueId, newStatus));
  }

  return (
    <>
      {/* Bottom pill overlay */}
      {anySelected && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 shadow-xl text-sm text-zinc-200 overflow-hidden">
            <span className="px-4 py-2">{selectedIds.size} selected</span>
            <button
              onClick={() => { setSelectedIds(new Set()); lastSelectedId.current = null; }}
              className="flex items-center justify-center px-3 py-2 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Deselect all"
            >
              ✕
            </button>
            <div className="w-px h-5 bg-zinc-700" />
            <span className="flex items-center gap-1.5 px-4 py-2 text-zinc-400 text-xs">
              <kbd className="font-sans">⌘⌫</kbd> to delete
            </span>
          </div>
        </div>
      )}

      <DndContext id="issues-dnd" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {STATUS_ORDER.map((status) => {
          const group = grouped[status];
          if (group.length === 0) return null;
          return (
            <StatusGroup
              key={status}
              status={status}
              issues={group}
              activeId={activeId}
              selectedIds={selectedIds}
              anySelected={anySelected}
              onSelect={handleSelect}
            />
          );
        })}
        <DragOverlay dropAnimation={null}>
          {activeIssue ? (
            <div className="flex items-center gap-3 border border-zinc-700 rounded bg-zinc-900 px-4 py-2.5 shadow-lg opacity-90 text-sm">
              <div className="w-4 shrink-0" />
              <PriorityIcon priority={activeIssue.priority} />
              <span className="text-zinc-400 text-xs shrink-0">{STATUS_ICONS[activeIssue.status]}</span>
              <span className="flex-1 truncate">{activeIssue.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
