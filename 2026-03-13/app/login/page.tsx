"use client";

import { useState } from "react";
import { signIn, signUp } from "@/actions/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const action = mode === "signin" ? signIn : signUp;
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-violet-500" />
            <span className="text-lg font-semibold tracking-tight">Linear</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {mode === "signin" ? "Sign in to Linear" : "Create your account"}
          </h1>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-violet-400 hover:text-violet-300"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-violet-400 hover:text-violet-300"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
