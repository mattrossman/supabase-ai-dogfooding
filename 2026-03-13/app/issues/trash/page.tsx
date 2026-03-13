import { createClient } from "@/lib/supabase/server";
import { TrashList } from "./TrashList";

export default async function TrashPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b border-zinc-800 px-6 py-4">
        <h1 className="text-sm font-medium">Trash</h1>
      </header>

      <div className="flex-1 overflow-auto">
        <TrashList initialIssues={issues ?? []} />
      </div>
    </div>
  );
}
