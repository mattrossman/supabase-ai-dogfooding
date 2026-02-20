"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import OwnerQuestionCard from "./owner-question-card";
import type { Database } from "@/lib/database.types";

type Question = Database["public"]["Tables"]["questions"]["Row"];

export default function SortableQuestionCard({
  question,
  onDelete,
}: {
  question: Question;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <OwnerQuestionCard
        question={question}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        dragHandleRef={setActivatorNodeRef}
      />
    </div>
  );
}
