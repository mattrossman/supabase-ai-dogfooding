import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { IssuesList } from "./IssuesList";

export default async function IssuesPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

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
        {issues && issues.length > 0 ? (
          <IssuesList initialIssues={issues} />
        ) : (
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
