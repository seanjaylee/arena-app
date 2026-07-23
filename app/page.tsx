import ArenaFeed from "@/components/ArenaFeed";
import { fetchArenasWithStats } from "@/lib/arena-data";

export default async function Home() {
  const items = await fetchArenasWithStats();
  return <ArenaFeed items={items} />;
}
