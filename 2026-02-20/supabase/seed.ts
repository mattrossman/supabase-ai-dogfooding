import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

// Read local Supabase config dynamically so it works for any dev
const status = JSON.parse(
  execSync("npx supabase status --output json", { encoding: "utf-8" })
);

const supabase = createClient(status.API_URL, status.SERVICE_ROLE_KEY);

async function main() {
  // 1. Create test owner account
  const { data: user, error: userError } =
    await supabase.auth.admin.createUser({
      email: "owner@test.com",
      password: "password123",
      email_confirm: true,
    });

  if (userError) {
    console.error("Failed to create user:", userError.message);
    process.exit(1);
  }

  const ownerId = user.user.id;
  console.log("Created user:", ownerId);

  // 2. Create a board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .insert({
      owner_id: ownerId,
      title: "AMA with the team",
      slug: "ama-with-the-team-seed",
    })
    .select()
    .single();

  if (boardError) {
    console.error("Failed to create board:", boardError.message);
    process.exit(1);
  }

  console.log("Created board:", board.slug);

  // 3. Insert sample questions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .insert([
      {
        board_id: board.id,
        content: "What's the roadmap for Q3?",
        author_name: "Alice",
      },
      {
        board_id: board.id,
        content: "How do you handle on-call rotations?",
        author_name: null,
      },
      {
        board_id: board.id,
        content: "Any plans to open-source the SDK?",
        author_name: "Bob",
      },
    ])
    .select();

  if (questionsError) {
    console.error("Failed to create questions:", questionsError.message);
    process.exit(1);
  }

  console.log("Created", questions.length, "questions");

  // 4. Reply to first question + mark answered
  const { error: replyError } = await supabase
    .from("questions")
    .update({
      reply: "We're focusing on performance and new integrations.",
      is_answered: true,
    })
    .eq("id", questions[0].id);

  if (replyError) {
    console.error("Failed to add reply:", replyError.message);
    process.exit(1);
  }

  // 5. Pin third question
  const { error: pinError } = await supabase
    .from("questions")
    .update({ is_pinned: true })
    .eq("id", questions[2].id);

  if (pinError) {
    console.error("Failed to pin question:", pinError.message);
    process.exit(1);
  }

  console.log("Seed complete!");
}

main();
