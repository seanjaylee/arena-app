"use client";

import { useState } from "react";
import type { CommentWithMeta } from "@/lib/comment-types";

export default function CommentItem({
  comment,
  onLike,
  highlight = false,
}: {
  comment: CommentWithMeta;
  onLike: (commentId: string) => void;
  highlight?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isBlurred = comment.spoiler_flag && !revealed;

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-gold/40 bg-gold/[0.06]" : "border-line bg-surface"
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-[13px] text-muted">
        <span className="font-semibold text-ink-soft">
          {comment.profiles?.nickname ?? "탈퇴한 유저"}
        </span>
        <span>
          {new Date(comment.created_at).toLocaleString("ko-KR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </div>

      {isBlurred ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="group relative w-full overflow-hidden rounded-lg bg-surface-2 py-4 text-left"
        >
          <span className="block select-none px-2 text-[15px] text-ink-soft blur-sm">
            {comment.body}
          </span>
          <span className="absolute inset-0 flex items-center justify-center gap-1 text-[13px] font-semibold text-gold">
            ⚠ 스포일러 · 눌러서 보기
          </span>
        </button>
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
          {comment.spoiler_flag && (
            <span className="mr-1.5 rounded bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-gold">
              스포일러
            </span>
          )}
          {comment.body}
        </p>
      )}

      <div className="mt-3 flex items-center">
        <button
          type="button"
          onClick={() => onLike(comment.id)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
            comment.liked_by_me
              ? "border-corner-a/50 bg-corner-a/10 text-corner-a-soft"
              : "border-line bg-surface-2 text-muted hover:text-ink"
          }`}
          aria-pressed={comment.liked_by_me}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={comment.liked_by_me ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {comment.like_count > 0 ? comment.like_count.toLocaleString() : "좋아요"}
        </button>
      </div>
    </div>
  );
}
