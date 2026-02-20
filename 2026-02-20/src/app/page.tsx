import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">AskBoard</h1>
        <p className="mt-4 text-lg text-foreground/70">
          Create an anonymous Q&A board and share the link. Your audience asks
          questions — no sign-up required.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
