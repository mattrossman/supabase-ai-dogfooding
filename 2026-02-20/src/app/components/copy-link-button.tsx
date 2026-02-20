"use client";

import { useState } from "react";

export default function CopyLinkButton({
  path,
  variant = "light",
}: {
  path: string;
  variant?: "light" | "ghost";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-md border border-stone-600 px-3.5 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:border-stone-400 hover:text-stone-100"
      >
        {copied ? "✓ Copied" : "Copy link"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
    >
      {copied ? "✓ Copied" : "Copy link"}
    </button>
  );
}
