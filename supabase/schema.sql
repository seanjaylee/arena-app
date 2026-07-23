-- 컨텐츠 아레나 MVP 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 실행하세요.

-- 프로필 (Supabase Auth의 auth.users 확장)
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  nickname text not null,
  profile_img text,
  created_at timestamptz default now()
);

-- 대결
create table if not exists arenas (
  id uuid default gen_random_uuid() primary key,
  title text,
  side_a_title text not null,
  side_a_image text,
  side_b_title text not null,
  side_b_image text,
  creator_id uuid references profiles(id),
  start_at timestamptz default now(),
  end_at timestamptz not null,
  created_at timestamptz default now()
);

-- 투표 (1인 1표 강제: arena_id + user_id 유니크)
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  arena_id uuid references arenas(id) on delete cascade,
  user_id uuid references profiles(id),
  side text check (side in ('A','B')) not null,
  created_at timestamptz default now(),
  unique (arena_id, user_id)
);

-- 논쟁 스레드 댓글
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  arena_id uuid references arenas(id) on delete cascade,
  user_id uuid references profiles(id),
  side text check (side in ('A','B')) not null,
  body text not null,
  spoiler_flag boolean default false,
  created_at timestamptz default now()
);

-- RLS 활성화 (기본: 전체 조회 가능, 쓰기는 로그인 유저만)
alter table profiles enable row level security;
alter table arenas enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

drop policy if exists "arenas_select_all" on arenas;
create policy "arenas_select_all" on arenas for select using (true);
drop policy if exists "arenas_insert_auth" on arenas;
create policy "arenas_insert_auth" on arenas for insert with check (auth.uid() is not null);

drop policy if exists "votes_select_all" on votes;
create policy "votes_select_all" on votes for select using (true);
drop policy if exists "votes_insert_own" on votes;
create policy "votes_insert_own" on votes for insert with check (auth.uid() = user_id);

drop policy if exists "comments_select_all" on comments;
create policy "comments_select_all" on comments for select using (true);
drop policy if exists "comments_insert_auth" on comments;
create policy "comments_insert_auth" on comments for insert with check (auth.uid() = user_id);

-- Google 로그인 성공 시 profiles 테이블에 자동으로 행 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, profile_img)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이미지 업로드용 Storage 버킷 (작품 이미지, 공개 읽기)
insert into storage.buckets (id, name, public)
values ('arena-images', 'arena-images', true)
on conflict (id) do nothing;

drop policy if exists "arena_images_public_read" on storage.objects;
create policy "arena_images_public_read" on storage.objects
  for select using (bucket_id = 'arena-images');

drop policy if exists "arena_images_auth_upload" on storage.objects;
create policy "arena_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'arena-images' and auth.uid() is not null);
