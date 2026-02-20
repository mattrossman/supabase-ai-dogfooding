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
    .order("is_pinned", { ascending: false })
    .order("is_answered", { ascending: false })
    .order("position", { ascending: true });

  return (
    <div className="min-h-screen bg-[#f9f6f1]">
      {/* Masthead */}
      <div className="border-b border-stone-200 bg-stone-900 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-stone-500">
            Q&amp;A Board
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-stone-100">
            {board.title}
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Ask anonymously — no sign-up required
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Ask form */}
        <div className="mb-10 border-b border-stone-200 pb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Ask a question
          </p>
          <QuestionForm boardId={board.id} />
        </div>

        {/* Questions */}
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Questions
          </p>
          <QuestionList
            boardId={board.id}
            initialQuestions={questions ?? []}
            isOwner={false}
          />
        </div>
      </div>
    </div>
  );
}
