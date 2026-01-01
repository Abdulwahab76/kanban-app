import { useState } from 'react'
import type { KanbanData } from '../../types'
import { initialData } from '../data/initialData'

export function useKanban() {
    const [data, setData] = useState<KanbanData>(initialData)

    const moveCard = (cardId: string, toColumnId: string) => {
        setData(prev => {
            let fromColumnId: string | null = null
            let movingCard = null

            // find card + source column
            for (const column of Object.values(prev.columns)) {
                const card = column.cards.find(c => c.id === cardId)
                if (card) {
                    fromColumnId = column.id
                    movingCard = card
                    break
                }

            }

            if (!fromColumnId || !movingCard || fromColumnId === toColumnId) {
                return prev
            }

            return {
                columns: {
                    ...prev.columns,
                    [fromColumnId]: {
                        ...prev.columns[fromColumnId],
                        cards: prev.columns[fromColumnId].cards.filter(
                            c => c.id !== cardId
                        ),
                    },
                    [toColumnId]: {
                        ...prev.columns[toColumnId],
                        cards: [...prev.columns[toColumnId].cards, { ...movingCard, progress: toColumnId === 'done' ? 100 : toColumnId === 'doing' ? 52 : 0 }],
                    },
                },
            }
        })
    }

    const addCard = (columnId: string, title: string) => {
        const newCard = {
            id: crypto.randomUUID(), // ✅ correct way
            title,
        }

        setData(prev => ({
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    cards: [...prev.columns[columnId].cards, newCard],
                },
            },
        }))
    }

    return { data, moveCard, addCard }
}
