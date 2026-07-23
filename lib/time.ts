export function timeLeftLabel(endAt: string): string {
  const diffMs = new Date(endAt).getTime() - Date.now();
  if (diffMs <= 0) return "종료됨";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days}일 ${hours % 24}시간 남음`;
  if (hours >= 1) return `${hours}시간 남음`;
  const minutes = Math.floor(diffMs / (1000 * 60));
  return `${Math.max(minutes, 1)}분 남음`;
}

export function isEnded(endAt: string): boolean {
  return new Date(endAt).getTime() <= Date.now();
}
