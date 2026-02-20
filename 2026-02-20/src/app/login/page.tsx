"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-stone-900">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl italic text-stone-100"
        >
          AskBoard
        </Link>
        <div>
          <p className="font-[family-name:var(--font-display)] text-4xl italic leading-snug text-stone-300">
            "Your audience has questions. Make it easy to ask them."
          </p>
        </div>
        <p className="text-xs text-stone-600">
          Anonymous Q&amp;A for live events
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-[#f9f6f1] px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 block font-[family-name:var(--font-display)] text-xl italic text-stone-900 lg:hidden"
          >
            AskBoard
          </Link>

          <h1 className="text-xl font-semibold text-stone-900">
            {isSignUp ? "Create an account" : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isSignUp
              ? "Start hosting anonymous Q&A sessions"
              : "Welcome back"}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-stone-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-medium text-stone-900 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
