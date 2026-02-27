"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/notes";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-muted mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-muted mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>
      {error && (
        <p className="text-sm text-accent" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-charcoal text-cream rounded font-display hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-muted text-center">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
      <p className="text-sm text-muted text-center pt-2">
        <button
          type="button"
          onClick={() => {
            setEmail("demo@example.com");
            setPassword("demo123");
          }}
          className="text-accent hover:underline"
        >
          Use demo account
        </button>
      </p>
    </form>
  );
}
