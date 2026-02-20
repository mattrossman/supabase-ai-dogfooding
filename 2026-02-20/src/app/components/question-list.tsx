"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import QuestionCard from "./question-card";
import OwnerQuestionCard from "./owner-question-card";

type Question = Database["public"]["Tables"]["questions"]["Row"];

function sortQuestions(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    if (a.is_answered !== b.is_answered) return a.is_answered ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default function QuestionList({
  boardId,
  initialQuestions,
  isOwner,
}: {
  boardId: string;
  initialQuestions: Question[];
  isOwner: boolean;
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const sorted = sortQuestions(questions);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`board:${boardId}:questions`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setQuestions((prev) => {
            if (prev.some((q) => q.id === (payload.new as Question).id))
              return prev;
            return [payload.new as Question, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === (payload.new as Question).id
                ? (payload.new as Question)
                : q
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "questions",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setQuestions((prev) =>
            prev.filter((q) => q.id !== (payload.old as { id: string }).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);

  function handleDelete(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  if (sorted.length === 0) {
    return (
      <p className="text-center text-foreground/50 py-8">
        No questions yet. {isOwner ? "Share the board link to get started!" : "Be the first to ask!"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((question) =>
        isOwner ? (
          <OwnerQuestionCard
            key={question.id}
            question={question}
            onDelete={handleDelete}
          />
        ) : (
          <QuestionCard key={question.id} question={question} />
        )
      )}
    </div>
  );
}
