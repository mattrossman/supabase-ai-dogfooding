import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuestionForm from "@/app/components/question-form";
import QuestionList from "@/app/components/question-list";

export default async function PublicBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!board) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("board_id", board.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{board.title}</h1>
      <p className="mt-1 text-sm text-foreground/50">
        Ask a question anonymously
      </p>

      <div className="mt-6">
        <QuestionForm boardId={board.id} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Questions</h2>
        <QuestionList
          boardId={board.id}
          initialQuestions={questions ?? []}
          isOwner={false}
        />
      </div>
    </main>
  );
}
