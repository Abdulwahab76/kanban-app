export type CardType = {
    id: string
    title: string
    progress?: number
    tags?: string[]
    avatars?: string[]
}


export type ColumnType = {
    id: string
    title: string
    cards: CardType[]
}


export type KanbanData = {
    columns: Record<string, ColumnType>
}
// Add this type for edit mode
export type EditMode = {
    cardId: string;
    columnId: string;
    isEditing: boolean;
};