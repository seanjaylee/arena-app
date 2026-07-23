import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArenaDetail from "@/components/ArenaDetail";
import type { CommentWithProfile } from "@/lib/comment-types";
import type { Side } from "@/lib/types";

export default async function ArenaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: arena } = await supabase.from("arenas").select("*").eq("id", id).single();
  if (!arena) notFound();

  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const [{ data: votes }, { data: comments }, myVoteResult] = await Promise.all([
    supabase.from("votes").select("side").eq("arena_id", id),
    supabase
      .from("comments")
      .select("*, profiles(nickname, profile_img)")
      .eq("arena_id", id)
      .order("created_at", { ascending: true }),
    currentUserId
      ? supabase
          .from("votes")
          .select("side")
          .eq("arena_id", id)
          .eq("user_id", currentUserId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const votesA = (votes ?? []).filter((v) => v.side === "A").length;
  const votesB = (votes ?? []).filter((v) => v.side === "B").length;

  return (
    <ArenaDetail
      arena={arena}
      initialVotesA={votesA}
      initialVotesB={votesB}
      initialMyVote={(myVoteResult?.data?.side as Side | undefined) ?? null}
      initialComments={(comments ?? []) as unknown as CommentWithProfile[]}
      currentUserId={currentUserId}
    />
  );
}
