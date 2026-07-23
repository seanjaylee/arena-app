import type { CommentWithProfile, CommentWithMeta } from "@/lib/comment-types";

/** 원본 댓글 목록에 좋아요 수 / 내가 눌렀는지 여부를 합칩니다. */
export function enrichComments(
  comments: CommentWithProfile[],
  likes: { comment_id: string; user_id: string }[],
  currentUserId: string | null
): CommentWithMeta[] {
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const l of likes) {
    counts.set(l.comment_id, (counts.get(l.comment_id) ?? 0) + 1);
    if (currentUserId && l.user_id === currentUserId) mine.add(l.comment_id);
  }
  return comments.map((c) => ({
    ...c,
    like_count: counts.get(c.id) ?? 0,
    liked_by_me: mine.has(c.id),
  }));
}

/**
 * 전체 댓글 중 좋아요를 가장 많이 받은 1개를 베스트로 뽑고(좋아요 1개 이상일 때만),
 * 나머지는 그대로 반환합니다. 동점이면 더 최신 댓글을 우선합니다.
 */
export function pickBestComment(comments: CommentWithMeta[]): {
  best: CommentWithMeta | null;
  rest: CommentWithMeta[];
} {
  let best: CommentWithMeta | null = null;
  for (const c of comments) {
    if (c.like_count < 1) continue;
    if (
      !best ||
      c.like_count > best.like_count ||
      (c.like_count === best.like_count &&
        new Date(c.created_at).getTime() > new Date(best.created_at).getTime())
    ) {
      best = c;
    }
  }
  const rest = best ? comments.filter((c) => c.id !== best!.id) : comments;
  return { best, rest };
}

/** 최신순 정렬 (내림차순) */
export function sortNewest(comments: CommentWithMeta[]): CommentWithMeta[] {
  return [...comments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
