"use client";

import CommentItem from "@/components/CommentItem";
import type { CommentWithMeta } from "@/lib/comment-types";

export default function CommentList({
  comments,
  onLike,
}: {
  comments: CommentWithMeta[];
  onLike: (commentId: string) => void;
}) {
  if (comments.length === 0) {
    return (
      <p className="py-10 text-center text-[15px] text-muted">
        아직 이 편엔 댓글이 없어요. 첫 논쟁을 시작해보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onLike={onLike} />
      ))}
    </div>
  );
}
