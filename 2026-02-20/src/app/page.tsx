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
    <main className="flex min-h-screen flex-col bg-stone-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-6">
        <span className="font-[family-name:var(--font-display)] text-xl italic text-stone-100">
          AskBoard
        </span>
        <Link
          href="/login"
          className="text-sm text-stone-400 transition-colors hover:text-stone-100"
        >
          Sign in
        </Link>
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
          Live Q&amp;A for your audience
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,9rem)] italic leading-none text-stone-100">
          AskBoard
        </h1>
        <p className="mt-8 max-w-sm text-base leading-relaxed text-stone-400">
          Create a board, share the link. Your audience asks questions
          anonymously — you reply, pin, and curate in real time.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-7 py-3 text-sm font-semibold text-stone-900 transition-all hover:bg-amber-400"
        >
          Create your first board →
        </Link>
      </div>

      {/* Footer rule */}
      <div className="border-t border-stone-800 px-8 py-5 text-xs text-stone-600">
        Anonymous. No sign-up for your audience.
      </div>
    </main>
  );
}
