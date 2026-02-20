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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Boards</h1>
      </div>

      <CreateBoardForm />

      {boards && boards.length > 0 ? (
        <div className="mt-8 space-y-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between rounded-lg border border-foreground/10 p-4"
            >
              <div>
                <Link
                  href={`/dashboard/${board.slug}`}
                  className="font-medium hover:underline"
                >
                  {board.title}
                </Link>
                <p className="mt-1 text-sm text-foreground/50">
                  /board/{board.slug}
                </p>
              </div>
              <CopyLinkButton path={`/board/${board.slug}`} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-foreground/50">
          No boards yet. Create one above!
        </p>
      )}
    </div>
  );
}
