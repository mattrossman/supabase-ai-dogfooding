"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#f9f6f1]">
      <header className="border-b border-stone-200 bg-stone-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-display)] text-lg italic text-stone-100"
          >
            AskBoard
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-stone-400 transition-colors hover:text-stone-100"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
    </div>
  );
}
