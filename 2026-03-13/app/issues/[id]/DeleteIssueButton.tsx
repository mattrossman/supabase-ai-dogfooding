"use client";

import { useTransition } from "react";
import { deleteIssue } from "@/actions/issues";

export function DeleteIssueButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Move this issue to trash?")) return;
    startTransition(() => deleteIssue(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-zinc-700 hover:text-red-500 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete issue"}
    </button>
  );
}
