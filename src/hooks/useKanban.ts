// hooks/useKanban.ts
import { useState } from 'react';
import type { KanbanData, EditMode } from '../../types';
import { initialData } from '../data/initialData';

export const useKanban = () => {
    const [data, setData] = useState<KanbanData>(initialData);
    const [editMode, setEditMode] = useState<EditMode | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const addCard = (columnId: string, title: string) => {
        const newCard = {
            id: Date.now().toString(),
            title,
            progress: 0,
            tags: [],
            avatars: []
        };

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    cards: [...prev.columns[columnId].cards, newCard]
                }
            }
        }));
    };

    const moveCard = (cardId: string, targetColumnId: string) => {
        setData(prev => {
            // Find the source column and card
            let sourceColumnId = '';
            let cardToMove = null;

            Object.entries(prev.columns).forEach(([colId, column]) => {
                const cardIndex = column.cards.findIndex(card => card.id === cardId);
                if (cardIndex > -1) {
                    sourceColumnId = colId;
                    cardToMove = column.cards[cardIndex];
                }
            });

            if (!cardToMove || sourceColumnId === targetColumnId) return prev;

            // Remove from source column
            const updatedSourceCards = prev.columns[sourceColumnId].cards
                .filter(card => card.id !== cardId);

            // Add to target column
            const updatedTargetCards = [
                ...prev.columns[targetColumnId].cards,
                cardToMove
            ];

            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [sourceColumnId]: {
                        ...prev.columns[sourceColumnId],
                        cards: updatedSourceCards
                    },
                    [targetColumnId]: {
                        ...prev.columns[targetColumnId],
                        cards: updatedTargetCards
                    }
                }
            };
        });
    };

    // hooks/useKanban.ts
    const deleteCard = (cardId: string, columnId: string) => {
        console.log('Deleting card:', cardId, 'from column:', columnId); // Debug log

        setData(prev => {
            const column = prev.columns[columnId];
            if (!column) {
                console.error('Column not found:', columnId);
                return prev;
            }

            const updatedCards = column.cards.filter(card => card.id !== cardId);
            console.log('Updated cards:', updatedCards);

            return {
                ...prev,
                columns: {
                    ...prev.columns,
                    [columnId]: {
                        ...column,
                        cards: updatedCards
                    }
                }
            };
        });
    };

    const startEdit = (cardId: string, columnId: string, currentTitle: string) => {
        setEditMode({ cardId, columnId, isEditing: true });
        setEditTitle(currentTitle);
    };

    const saveEdit = () => {
        if (!editMode || !editTitle.trim()) return;

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [editMode.columnId]: {
                    ...prev.columns[editMode.columnId],
                    cards: prev.columns[editMode.columnId].cards.map(card =>
                        card.id === editMode.cardId
                            ? { ...card, title: editTitle.trim() }
                            : card
                    )
                }
            }
        }));

        setEditMode(null);
        setEditTitle('');
    };

    const cancelEdit = () => {
        setEditMode(null);
        setEditTitle('');
    };

    return {
        data,
        addCard,
        moveCard,
        deleteCard,
        startEdit,
        saveEdit,
        cancelEdit,
        editMode,
        editTitle,
        setEditTitle
    };
};