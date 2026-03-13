"use client";

import { useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import { createIssue } from "@/actions/issues";
import { STATUS_LABELS, STATUS_ORDER, PRIORITY_LABELS } from "@/lib/types";

const PRIORITY_ORDER = [
  "no_priority",
  "urgent",
  "high",
  "medium",
  "low",
] as const;

export function NewIssueForm() {
  const [error, action, isPending] = useActionState(createIssue, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div>
        <input
          name="title"
          placeholder="Issue title"
          required
          autoFocus
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base outline-none placeholder:text-zinc-600 focus:border-violet-500"
        />
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Add a description..."
          rows={5}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500 resize-none"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-zinc-500">Status</label>
          <select
            name="status"
            defaultValue="backlog"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-zinc-500">Priority</label>
          <select
            name="priority"
            defaultValue="no_priority"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/issues"
          className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create issue"}
        </button>
      </div>
    </form>
  );
}
