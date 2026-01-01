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