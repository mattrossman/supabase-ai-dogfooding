import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { searchNotes } from "../actions";
import { PageHeader } from "../_components/page-header";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const query = q?.trim() ?? "";
  const results = query ? await searchNotes(query) : [];

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader defaultQuery={query} />

      <main className="px-6 py-8">
        <div className="max-w-[720px] mx-auto">
          <Link
            href="/notes"
            className="text-sm text-muted hover:text-charcoal transition-colors"
          >
            ← Back
          </Link>

          {query ? (
            <>
              <h1 className="font-display text-xl text-charcoal mt-4 mb-6">
                Results for &ldquo;{query}&rdquo;
              </h1>
              {results.length === 0 ? (
                <p className="text-muted">No matching notes found.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((note) => (
                    <li key={note.id}>
                      <Link
                        href={`/notes/${note.id}`}
                        className="block px-4 py-4 rounded border border-charcoal/10 bg-cream-dark hover:border-charcoal/25 transition-colors"
                      >
                        <p className="text-charcoal text-sm">{note.content}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-muted mt-4">Enter a query to search your notes.</p>
          )}
        </div>
      </main>
    </div>
  );
}
