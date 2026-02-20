"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";
import QuestionCard from "./question-card";
import SortableQuestionCard from "./sortable-question-card";

type Question = Database["public"]["Tables"]["questions"]["Row"];

function sortQuestions(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    if (a.is_answered !== b.is_answered) return a.is_answered ? -1 : 1;
    return a.position - b.position;
  });
}

type Group = "pinned" | "answered" | "regular";

function getGroup(q: Question): Group {
  if (q.is_pinned) return "pinned";
  if (q.is_answered) return "answered";
  return "regular";
}

function splitIntoGroups(questions: Question[]) {
  const sorted = sortQuestions(questions);
  return {
    pinned: sorted.filter((q) => q.is_pinned),
    answered: sorted.filter((q) => !q.is_pinned && q.is_answered),
    regular: sorted.filter((q) => !q.is_pinned && !q.is_answered),
  };
}

const GROUP_LABELS: Record<Group, string> = {
  pinned: "Pinned",
  answered: "Answered",
  regular: "Questions",
};

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeQ = questions.find((q) => q.id === active.id);
    const overQ = questions.find((q) => q.id === over.id);
    if (!activeQ || !overQ) return;

    // Only allow reorder within same group
    if (getGroup(activeQ) !== getGroup(overQ)) return;

    const groups = splitIntoGroups(questions);
    const group = groups[getGroup(activeQ)];
    const oldIndex = group.findIndex((q) => q.id === active.id);
    const newIndex = group.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(group, oldIndex, newIndex);

    // Assign new positions
    const updates = reordered.map((q, i) => ({ id: q.id, position: i + 1 }));

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => {
        const update = updates.find((u) => u.id === q.id);
        return update ? { ...q, position: update.position } : q;
      })
    );

    // Persist to DB
    const supabase = createClient();
    await supabase.rpc("reorder_questions", {
      payload: updates,
    });
  }

  const sorted = sortQuestions(questions);

  if (sorted.length === 0) {
    return (
      <p className="text-center text-foreground/50 py-8">
        No questions yet. {isOwner ? "Share the board link to get started!" : "Be the first to ask!"}
      </p>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-3">
        {sorted.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    );
  }

  const groups = splitIntoGroups(questions);
  const groupOrder: Group[] = ["pinned", "answered", "regular"];
  const activeGroups = groupOrder.filter((g) => groups[g].length > 0);
  const [collapsed, setCollapsed] = useState<Partial<Record<Group, boolean>>>({});

  function toggleGroup(g: Group) {
    setCollapsed((prev) => ({ ...prev, [g]: !prev[g] }));
  }

  return (
    <DndContext
      id="question-list-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {activeGroups.map((groupKey) => (
          <div key={groupKey}>
            {activeGroups.length > 1 && (
              <button
                onClick={() => toggleGroup(groupKey)}
                className="flex items-center gap-1.5 mb-2 group"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  className={`text-foreground/30 transition-transform ${collapsed[groupKey] ? "-rotate-90" : ""}`}
                >
                  <path d="M2 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide group-hover:text-foreground/60 transition-colors">
                  {GROUP_LABELS[groupKey]} ({groups[groupKey].length})
                </span>
              </button>
            )}
            {!collapsed[groupKey] && (
              <SortableContext
                items={groups[groupKey].map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {groups[groupKey].map((question) => (
                    <SortableQuestionCard
                      key={question.id}
                      question={question}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        ))}
      </div>
    </DndContext>
  );
}
