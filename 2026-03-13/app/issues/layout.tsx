import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export default async function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-zinc-800 bg-[#0f0f0f]">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="h-5 w-5 rounded bg-violet-500" />
          <span className="text-sm font-semibold">Linear</span>
        </div>

        <nav className="flex-1 px-2 py-2">
          <Link
            href="/issues"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Issues
          </Link>
        </nav>

        <div className="border-t border-zinc-800 px-3 py-3">
          <div className="mb-2 text-xs text-zinc-500 truncate">{user?.email}</div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
