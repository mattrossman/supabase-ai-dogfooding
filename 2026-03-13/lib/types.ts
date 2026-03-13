export type { Database } from "./database.types";

import type { Database } from "./database.types";

export type IssueStatus = Database["public"]["Enums"]["issue_status"];
export type IssuePriority = Database["public"]["Enums"]["issue_priority"];
export type Issue = Database["public"]["Tables"]["issues"]["Row"];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  no_priority: "No Priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const STATUS_ORDER: IssueStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
];
