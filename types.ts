export interface CommentType {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: ProfileType;
}
export interface CardWithComments {
  id: string;
  title: string;
  description: string | null;
  progress: number | null;
  due_date: string | null;
  position: number | null;
  column_id: string;
  created_at: string | null;
  updated_at: string | null;
  comments?: Array<{
    id: string;
    card_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
  }>;
}
export interface CardType {
  id: string;
  title: string;
  description?: string;
  progress?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  position?: number;
  column_id?: string;
  user_id?: string;
  comments?: CommentType[];
}

export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
  color?: string;
  position?: number;
  board_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BoardType {
  id: string;
  title: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
// types/index.ts - Updated ProfileType

export interface ProfileType {
  id: string;
  email: string;
  username: string; // ✅ Now required, not optional
  full_name?: string; // Optional full name
  avatar_url?: string; // Optional avatar URL
  created_at?: string;
  updated_at?: string;
}

export interface CommentType {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: ProfileType;
}
