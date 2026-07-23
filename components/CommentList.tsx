"use client";

import { useState } from "react";
import type { CommentWithProfile } from "@/lib/comment-types";

export default function CommentList({ comments }: { comments: CommentWithProfile[] }) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (comments.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => {
        const isBlurred = c.spoiler_flag && !revealed.has(c.id);
        return (
          <div key={c.id} className="rounded-xl border border-gray-200 p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-700">{c.profiles?.nickname ?? "탈퇴한 유저"}</span>
              <span>{new Date(c.created_at).toLocaleString("ko-KR")}</span>
            </div>
            {isBlurred ? (
              <button
                type="button"
                onClick={() => setRevealed((prev) => new Set(prev).add(c.id))}
                className="w-full rounded-lg bg-gray-100 py-3 text-xs text-gray-400 blur-[3px] hover:blur-none transition"
              >
                {c.body}
              </button>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {c.spoiler_flag && <span className="mr-1 rounded bg-yellow-100 px-1 text-[10px] text-yellow-700">스포일러</span>}
                {c.body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
