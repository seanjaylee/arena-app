import ArenaFeed from "@/components/ArenaFeed";
import { fetchArenasWithStats } from "@/lib/arena-data";

// 실시간 데이터(대결/투표/댓글)라 매 요청마다 최신 상태를 조회
export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await fetchArenasWithStats();
  return <ArenaFeed items={items} />;
}
