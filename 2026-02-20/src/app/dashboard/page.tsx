import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreateBoardForm from "@/app/components/create-board-form";
import CopyLinkButton from "@/app/components/copy-link-button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-end justify-between border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-stone-400">
            Dashboard
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-stone-900">
            Your Boards
          </h1>
        </div>
      </div>

      <CreateBoardForm />

      {boards && boards.length > 0 ? (
        <div className="mt-6 divide-y divide-stone-200">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between py-4"
            >
              <div>
                <Link
                  href={`/dashboard/${board.slug}`}
                  className="font-medium text-stone-900 transition-colors hover:text-amber-600"
                >
                  {board.title}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-stone-400">
                  /board/{board.slug}
                </p>
              </div>
              <CopyLinkButton path={`/board/${board.slug}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl italic text-stone-400">
            No boards yet
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Create one above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
