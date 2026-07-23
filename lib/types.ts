export type Side = "A" | "B";

export type Profile = {
  id: string;
  nickname: string;
  profile_img: string | null;
  created_at: string;
};

export type Arena = {
  id: string;
  title: string | null;
  side_a_title: string;
  side_a_image: string | null;
  side_b_title: string;
  side_b_image: string | null;
  creator_id: string | null;
  start_at: string;
  end_at: string;
  created_at: string;
};

export type Vote = {
  id: string;
  arena_id: string;
  user_id: string;
  side: Side;
  created_at: string;
};

export type Comment = {
  id: string;
  arena_id: string;
  user_id: string;
  side: Side;
  body: string;
  spoiler_flag: boolean;
  created_at: string;
};
