"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { IssueStatus, IssuePriority } from "@/lib/types";

// Returns error message string (for useActionState), or redirects on success
export async function createIssue(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.from("issues").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    status: (formData.get("status") as IssueStatus) || "backlog",
    priority: (formData.get("priority") as IssuePriority) || "no_priority",
  });
  if (error) return error.message;
  revalidatePath("/issues");
  redirect("/issues");
}

export async function updateIssueStatus(
  id: string,
  status: IssueStatus
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("issues").update({ status }).eq("id", id);
  revalidatePath("/issues");
  revalidatePath(`/issues/${id}`);
}

export async function updateIssuePriority(
  id: string,
  priority: IssuePriority
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("issues").update({ priority }).eq("id", id);
  revalidatePath("/issues");
  revalidatePath(`/issues/${id}`);
}

export async function deleteIssue(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("issues").delete().eq("id", id);
  revalidatePath("/issues");
  redirect("/issues");
}
