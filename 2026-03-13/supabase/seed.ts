import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

// secret key bypasses RLS for seeding
const supabase = createClient(url, secretKey);

const issues = [
  {
    title: "Set up authentication flow",
    description: "Implement email/password sign in and sign up with Supabase Auth.",
    status: "done",
    priority: "urgent",
  },
  {
    title: "Design issue list view",
    description: "Group issues by status with counts and priority indicators.",
    status: "done",
    priority: "high",
  },
  {
    title: "Add keyboard shortcuts",
    description: "C to create issue, backspace to go back, / to search.",
    status: "todo",
    priority: "medium",
  },
  {
    title: "Implement issue search",
    description: "Full-text search across issue titles and descriptions.",
    status: "backlog",
    priority: "medium",
  },
  {
    title: "Add labels support",
    description: "Allow tagging issues with colored labels like Bug, Feature, Improvement.",
    status: "backlog",
    priority: "low",
  },
  {
    title: "Build kanban board view",
    description: "Drag-and-drop columns grouped by status.",
    status: "in_progress",
    priority: "high",
  },
  {
    title: "Add due dates",
    description: "Date picker on issues with overdue highlighting.",
    status: "backlog",
    priority: "low",
  },
  {
    title: "Fix status select dropdown styling",
    description: "The native select looks inconsistent on macOS Safari.",
    status: "todo",
    priority: "medium",
  },
  {
    title: "Write seed script",
    description: "Populate local DB with realistic test data.",
    status: "done",
    priority: "low",
  },
  {
    title: "Set up CI/CD pipeline",
    description: "GitHub Actions for lint, type-check, and test on every PR.",
    status: "backlog",
    priority: "medium",
  },
  {
    title: "Add issue comments",
    description: "Threaded comments on issue detail page.",
    status: "backlog",
    priority: "low",
  },
  {
    title: "Implement optimistic updates",
    description: "Status changes should feel instant before server confirmation.",
    status: "in_progress",
    priority: "high",
  },
  {
    title: "Export issues to CSV",
    description: "Download filtered issues as a spreadsheet.",
    status: "backlog",
    priority: "no_priority",
  },
  {
    title: "Fix RLS policies for team access",
    description: "All workspace members should be able to see all issues.",
    status: "canceled",
    priority: "urgent",
  },
  {
    title: "Add assignee field",
    description: "Assign issues to team members with avatar display.",
    status: "todo",
    priority: "medium",
  },
];

async function seed() {
  console.log("Creating demo user...");
  const { error: userError } = await supabase.auth.admin.createUser({
    email: "demo@example.com",
    password: "password",
    email_confirm: true,
  });
  if (userError && !userError.message.includes("already been registered")) {
    console.error("Error creating user:", userError.message);
    process.exit(1);
  }
  console.log("✓ Demo user: demo@example.com / password");

  console.log("Seeding issues...");
  const { data, error } = await supabase.from("issues").insert(issues).select();
  if (error) {
    console.error("Error seeding:", error.message);
    process.exit(1);
  }
  console.log(`✓ Inserted ${data.length} issues`);
}

seed();
