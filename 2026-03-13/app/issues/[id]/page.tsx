import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteIssue } from "@/actions/issues";
import { StatusSelect } from "../StatusSelect";
import { PrioritySelect } from "../PrioritySelect";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single();

  if (!issue) notFound();

  async function handleDelete() {
    "use server";
    await deleteIssue(id);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/issues"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Issues
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div className="border-b border-zinc-800 px-6 py-5">
          <h1 className="text-xl font-semibold">{issue.title}</h1>
        </div>

        {issue.description && (
          <div className="border-b border-zinc-800 px-6 py-4">
            <p className="whitespace-pre-wrap text-sm text-zinc-400">
              {issue.description}
            </p>
          </div>
        )}

        <div className="space-y-3 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="w-20 text-xs text-zinc-600">Status</span>
            <StatusSelect issue={issue} />
          </div>

          <div className="flex items-center gap-6">
            <span className="w-20 text-xs text-zinc-600">Priority</span>
            <PrioritySelect issue={issue} />
          </div>

          <div className="flex items-center gap-6">
            <span className="w-20 text-xs text-zinc-600">Created</span>
            <span className="text-xs text-zinc-500">
              {new Date(issue.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <form action={handleDelete} className="mt-8">
        <button
          type="submit"
          className="text-xs text-zinc-700 hover:text-red-500"
        >
          Delete issue
        </button>
      </form>
    </div>
  );
}
