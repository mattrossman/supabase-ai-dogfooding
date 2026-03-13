import Link from "next/link";
import { NewIssueForm } from "./NewIssueForm";

export default function NewIssuePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/issues"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Issues
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-sm font-medium">New Issue</h1>
      </div>

      <NewIssueForm />
    </div>
  );
}
