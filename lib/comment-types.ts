import type { Comment } from "@/lib/types";

export type CommentWithProfile = Comment & {
  profiles: { nickname: string; profile_img: string | null } | null;
};
