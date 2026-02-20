import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import QuestionList from "@/app/components/question-list";
import CopyLinkButton from "@/app/components/copy-link-button";

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
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{board.title}</h1>
          <p className="mt-1 text-sm text-foreground/50">
            Owner view &middot; /board/{board.slug}
          </p>
        </div>
        <CopyLinkButton path={`/board/${board.slug}`} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Questions</h2>
        <QuestionList
          boardId={board.id}
          initialQuestions={questions ?? []}
          isOwner={true}
        />
      </div>
    </div>
  );
}
