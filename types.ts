// types.ts
// types.ts
export interface CardType {
    id: string;
    title: string;
    description?: string;
    progress?: number;  // ✅ Now optional
    tags?: string[];
    avatars?: string[];
    due_date?: string;
    created_at?: string;
    updated_at?: string;
    position?: number;
    column_id?: string;
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
    id: string
    title: string
    description: string | null
    owner_id: string | null
    background_color: string | null
    is_public: boolean | null
    created_at: string | null
    updated_at: string | null
}

export interface ProfileType {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}
export interface KanbanData {
    columns: Record<string, ColumnType>;
}