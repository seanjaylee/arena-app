"use client";

import { useState } from "react";
import type { Side } from "@/lib/types";

export default function CommentInput({
  side,
  onSubmit,
}: {
  side: Side;
  onSubmit: (body: string, spoiler: boolean) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(body.trim(), spoiler);
      setBody("");
      setSpoiler(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isA = side === "A";

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-4 flex flex-col gap-2.5 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between text-[13px]">
        <span
          className={`rounded-full px-2.5 py-1 font-semibold ${
            isA ? "bg-corner-a/10 text-corner-a-soft" : "bg-corner-b/10 text-corner-b-soft"
          }`}
        >
          {isA ? "Red Corner" : "Blue Corner"}으로 참전
        </span>
        <label className="flex cursor-pointer items-center gap-1.5 text-muted">
          <input
            type="checkbox"
            checked={spoiler}
            onChange={(e) => setSpoiler(e.target.checked)}
            className="accent-gold"
          />
          스포일러
        </label>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="논쟁에 참전하세요..."
          className="flex-1 rounded-full border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-faint focus:border-ink-soft focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="shrink-0 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-bg transition hover:opacity-90 disabled:opacity-40"
        >
          등록
        </button>
      </div>
    </form>
  );
}
