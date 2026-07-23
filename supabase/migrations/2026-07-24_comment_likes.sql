-- 댓글 좋아요 기능 추가
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 실행하세요.

create table if not exists comment_likes (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references comments(id) on delete cascade,
  arena_id uuid references arenas(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique (comment_id, user_id)
);

alter table comment_likes enable row level security;

drop policy if exists "comment_likes_select_all" on comment_likes;
create policy "comment_likes_select_all" on comment_likes for select using (true);

drop policy if exists "comment_likes_insert_own" on comment_likes;
create policy "comment_likes_insert_own" on comment_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "comment_likes_delete_own" on comment_likes;
create policy "comment_likes_delete_own" on comment_likes
  for delete using (auth.uid() = user_id);
