"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PageHeader({ defaultQuery = "" }: { defaultQuery?: string }) {
  const [query, setQuery] = useState(defaultQuery);
  const router = useRouter();
  const supabase = createClient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/notes/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="border-b border-charcoal/10 px-6 py-4 flex items-center justify-between">
      <Link
        href="/notes"
        className="font-display text-xl text-charcoal hover:opacity-75 transition-opacity"
      >
        Notes
      </Link>
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            placeholder="Search by meaning…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 px-3 py-2 border border-charcoal/20 rounded bg-cream-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
          <button
            type="submit"
            className="px-3 py-2 border border-charcoal/20 rounded bg-cream-dark hover:bg-charcoal/5 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        </form>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-muted hover:text-charcoal transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
