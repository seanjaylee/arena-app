import { createClient } from "@/lib/supabase/server";
import type { Arena } from "@/lib/types";

export type ArenaWithStats = {
  arena: Arena;
  votesA: number;
  votesB: number;
  commentCount: number;
};

export async function fetchArenasWithStats(): Promise<ArenaWithStats[]> {
  const supabase = await createClient();

  const [{ data: arenas }, { data: votes }, { data: comments }] = await Promise.all([
    supabase.from("arenas").select("*").order("end_at", { ascending: true }),
    supabase.from("votes").select("arena_id, side"),
    supabase.from("comments").select("arena_id"),
  ]);

  const voteCounts = new Map<string, { A: number; B: number }>();
  for (const v of votes ?? []) {
    const entry = voteCounts.get(v.arena_id) ?? { A: 0, B: 0 };
    entry[v.side as "A" | "B"]++;
    voteCounts.set(v.arena_id, entry);
  }

  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) {
    commentCounts.set(c.arena_id, (commentCounts.get(c.arena_id) ?? 0) + 1);
  }

  return (arenas ?? []).map((arena) => ({
    arena,
    votesA: voteCounts.get(arena.id)?.A ?? 0,
    votesB: voteCounts.get(arena.id)?.B ?? 0,
    commentCount: commentCounts.get(arena.id) ?? 0,
  }));
}
