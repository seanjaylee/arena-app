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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{side === "A" ? "A파" : "B파"}로 댓글 남기기</span>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
          스포일러
        </label>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="논쟁에 참전하세요..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          등록
        </button>
      </div>
    </form>
  );
}
