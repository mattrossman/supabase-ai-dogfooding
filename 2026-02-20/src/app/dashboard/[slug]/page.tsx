import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import QuestionList from "@/app/components/question-list";
import CopyLinkButton from "@/app/components/copy-link-button";
import Link from "next/link";

export default async function OwnerBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!board) notFound();

  if (board.owner_id !== user.id) {
    redirect(`/board/${slug}`);
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("board_id", board.id)
    .order("is_pinned", { ascending: false })
    .order("is_answered", { ascending: false })
    .order("position", { ascending: true });

  return (
    <div>
      <div className="mb-8 border-b border-stone-200 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-stone-400">
              <Link href="/dashboard" className="hover:text-stone-600">
                Boards
              </Link>{" "}
              / Owner view
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-stone-900">
              {board.title}
            </h1>
            <p className="mt-1.5 font-mono text-xs text-stone-400">
              /board/{board.slug}
            </p>
          </div>
          <CopyLinkButton path={`/board/${board.slug}`} />
        </div>
      </div>

      <QuestionList
        boardId={board.id}
        initialQuestions={questions ?? []}
        isOwner={true}
      />
    </div>
  );
}
