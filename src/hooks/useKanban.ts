import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CardType, ColumnType } from '../../types';

export const useSupabaseKanban = (boardId: string | null) => {
    const [columns, setColumns] = useState<ColumnType[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data once on mount and when boardId changes
    const fetchData = useCallback(async () => {
        if (!boardId) {
            setColumns([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch columns with cards
            const { data: columnsData, error: columnsError } = await supabase
                .from('columns')
                .select(`
                    *,
                    cards (*)
                `)
                .eq('board_id', boardId)
                .order('position');

            if (columnsError) throw columnsError;

            // ✅ PROPERLY map columns with cards
            const typedColumns: ColumnType[] = (columnsData || []).map(column => {
                // ✅ Ensure cards is an array
                const cardsArray = Array.isArray(column.cards) ? column.cards : [];

                // ✅ Sort cards by position
                const sortedCards: CardType[] = cardsArray
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map(card => ({
                        id: card.id,
                        title: card.title,
                        description: card.description ?? '',
                        progress: card.progress ?? 0,
                        due_date: card.due_date ?? undefined,
                        position: card.position ?? 0,
                        column_id: card.column_id ?? column.id,
                        created_at: card.created_at ?? '',
                        updated_at: card.updated_at ?? ''
                    }));

                return {
                    id: column.id,
                    title: column.title,
                    color: column.color ?? '#e5e7eb',
                    position: column.position ?? 0,
                    board_id: column.board_id ?? undefined,
                    created_at: column.created_at ?? undefined,
                    updated_at: column.updated_at ?? undefined,
                    cards: sortedCards  // ✅ Yeh important hai - cards array set karein
                };
            });

            console.log('Columns with cards:', typedColumns);
            setColumns(typedColumns);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [boardId]);

    // Fetch data only on mount and when boardId changes
    useEffect(() => {
        fetchData();

    }, [fetchData]);

    // ✅ ADDED: Move card function
    const moveCard = useCallback(async (cardId: string, targetColumnId: string, newPosition?: number) => {
        try {
            console.log('📦 Moving card:', cardId, 'to column:', targetColumnId);

            // Find the card to move
            const cardToMove = cards.find(c => c.id === cardId);
            if (!cardToMove) {
                throw new Error('Card not found');
            }

            const sourceColumnId = cardToMove.column_id;

            console.log('Source column:', sourceColumnId, 'Target column:', targetColumnId);

            // If moving within same column, just update position
            if (sourceColumnId === targetColumnId) {
                console.log('Moving within same column');

                // Get all cards in this column
                const columnCards = cards
                    .filter(c => c.column_id === targetColumnId && c.id !== cardId)
                    .sort((a, b) => a.position - b.position);

                // Calculate new position
                const position = newPosition || columnCards.length + 1;

                // Update positions in database
                const updates = [];

                // First, update the moved card
                updates.push(
                    supabase
                        .from('cards')
                        .update({
                            position: position,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', cardId)
                );

                // Update other cards positions
                let currentPos = 1;
                for (const card of columnCards) {
                    if (currentPos === position) {
                        currentPos++; // Skip the position where we inserted the moved card
                    }
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: currentPos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    currentPos++;
                }

                await Promise.all(updates);

            } else {
                console.log('Moving to different column');

                // Moving to different column

                // Step 1: Get cards from source column (excluding the moved card)
                const sourceColumnCards = cards
                    .filter(c => c.column_id === sourceColumnId && c.id !== cardId)
                    .sort((a, b) => a.position - b.position);

                // Step 2: Get cards from target column
                const targetColumnCards = cards
                    .filter(c => c.column_id === targetColumnId)
                    .sort((a, b) => a.position - b.position);

                // Step 3: Calculate new position in target column
                const position = newPosition || targetColumnCards.length + 1;

                // Step 4: Update source column cards positions
                const updates = [];
                let sourcePos = 1;
                for (const card of sourceColumnCards) {
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: sourcePos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    sourcePos++;
                }

                // Step 5: Update target column cards positions
                let targetPos = 1;
                for (const card of targetColumnCards) {
                    if (targetPos === position) {
                        // Insert the moved card at this position
                        updates.push(
                            supabase
                                .from('cards')
                                .update({
                                    column_id: targetColumnId,
                                    position: targetPos,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', cardId)
                        );
                        targetPos++;
                    }

                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: targetPos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    targetPos++;
                }

                // If position is at the end
                if (position > targetColumnCards.length) {
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                column_id: targetColumnId,
                                position: position,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', cardId)
                    );
                }

                await Promise.all(updates);
            }

            console.log('✅ Card moved successfully');

            // Refresh data
            await fetchData();

        } catch (err) {
            console.error('❌ Error moving card:', err);
            throw err;
        }
    }, [cards, fetchData]);

    // ✅ ADDED: Simple move card function (alternative)
    const moveCardSimple = useCallback(async (cardId: string, targetColumnId: string, newPosition?: number) => {
        try {
            console.log('📦 Moving card:', cardId, 'to column:', targetColumnId);

            // Find the card in columns
            let cardToMove: CardType | null = null;
            let sourceColumnId = '';

            for (const column of columns) {
                const foundCard = column.cards.find(c => c.id === cardId);
                if (foundCard) {
                    cardToMove = foundCard;
                    sourceColumnId = column.id;
                    break;
                }
            }

            if (!cardToMove) {
                throw new Error('Card not found');
            }

            console.log('Source column:', sourceColumnId, 'Target column:', targetColumnId);

            // If moving within same column
            if (sourceColumnId === targetColumnId) {
                console.log('Moving within same column');

                const sourceColumn = columns.find(col => col.id === sourceColumnId);
                if (!sourceColumn) throw new Error('Source column not found');

                const columnCards = sourceColumn.cards.filter(c => c.id !== cardId);

                // Calculate new position
                const position = newPosition || columnCards.length + 1;

                // Update positions in database
                const updates = [];

                // Update the moved card
                updates.push(
                    supabase
                        .from('cards')
                        .update({
                            position: position,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', cardId)
                );

                // Update other cards positions
                let currentPos = 1;
                for (const card of columnCards) {
                    if (currentPos === position) {
                        currentPos++; // Skip the position where we inserted the moved card
                    }
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: currentPos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    currentPos++;
                }

                await Promise.all(updates);

                // Update local state
                setColumns(prev =>
                    prev.map(col => {
                        if (col.id === sourceColumnId) {
                            const updatedCards = col.cards
                                .map(card => {
                                    if (card.id === cardId) {
                                        return { ...card, position };
                                    }
                                    return card;
                                })
                                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

                            return { ...col, cards: updatedCards };
                        }
                        return col;
                    })
                );

            } else {
                console.log('Moving to different column');

                const sourceColumn = columns.find(col => col.id === sourceColumnId);
                const targetColumn = columns.find(col => col.id === targetColumnId);

                if (!sourceColumn || !targetColumn) {
                    throw new Error('Column not found');
                }

                // Step 1: Get cards from source column (excluding the moved card)
                const sourceColumnCards = sourceColumn.cards.filter(c => c.id !== cardId);

                // Step 2: Get cards from target column
                const targetColumnCards = targetColumn.cards;

                // Step 3: Calculate new position in target column
                const position = newPosition || targetColumnCards.length + 1;

                // Step 4: Update in database
                const updates = [];

                // Update source column cards positions
                let sourcePos = 1;
                for (const card of sourceColumnCards) {
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: sourcePos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    sourcePos++;
                }

                // Update target column cards positions and move the card
                updates.push(
                    supabase
                        .from('cards')
                        .update({
                            column_id: targetColumnId,
                            position: position,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', cardId)
                );

                // Update other target column cards positions
                let targetPos = 1;
                for (const card of targetColumnCards) {
                    if (targetPos === position) {
                        targetPos++; // Skip for moved card
                    }
                    updates.push(
                        supabase
                            .from('cards')
                            .update({
                                position: targetPos,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', card.id)
                    );
                    targetPos++;
                }

                await Promise.all(updates);

                // Update local state immediately
                setColumns(prev => {
                    // Remove card from source column
                    const updatedColumns = prev.map(col => {
                        if (col.id === sourceColumnId) {
                            return {
                                ...col,
                                cards: col.cards
                                    .filter(c => c.id !== cardId)
                                    .map((card, index) => ({
                                        ...card,
                                        position: index + 1
                                    }))
                            };
                        }
                        if (col.id === targetColumnId) {
                            // Add card to target column at correct position
                            const newCards = [...col.cards];
                            const movedCard = { ...cardToMove!, column_id: targetColumnId, position };

                            // Insert at correct position
                            newCards.splice(position - 1, 0, movedCard);

                            // Recalculate positions
                            const recalculatedCards = newCards.map((card, index) => ({
                                ...card,
                                position: index + 1
                            }));

                            return {
                                ...col,
                                cards: recalculatedCards
                            };
                        }
                        return col;
                    });

                    return updatedColumns;
                });
            }

            console.log('✅ Card moved successfully');

        } catch (err) {
            console.error('❌ Error moving card:', err);
            throw err;
        }
    }, [columns]);

    // Add column - simple version
    const addColumn = async (title: string): Promise<void> => {
        if (!boardId) throw new Error('No board selected');

        try {
            const maxPosition = Math.max(...columns.map(c => c.position ?? 0), 0);

            const { data, error } = await supabase
                .from('columns')
                .insert({
                    board_id: boardId,
                    title,
                    position: maxPosition + 1,
                    color: '#e5e7eb'
                })
                .select()
                .single();

            if (error) throw error;

            // Properly type the new column
            const newColumn: ColumnType = {
                id: data.id,
                title: data.title,
                cards: [],
                color: data.color ?? '#e5e7eb',
                position: data.position,
                board_id: data.board_id ?? undefined,
                created_at: data.created_at ?? undefined,
                updated_at: data.updated_at ?? undefined
            };

            setColumns(prev => [...prev, newColumn]);

        } catch (err) {
            console.error('Error adding column:', err);
            throw err;
        }
    };
    const updateColumn = async (
        columnId: string,
        updates: { title?: string; color?: string; position?: number }
    ): Promise<void> => {
        if (!boardId) throw new Error('No board selected');

        try {
            const { data, error } = await supabase
                .from('columns')
                .update(updates)
                .eq('id', columnId)
                .select()
                .single();

            if (error) throw error;

            setColumns(prev =>
                prev.map(col => {
                    if (col.id === columnId) {
                        return {
                            ...col,
                            ...updates,
                            updated_at: data.updated_at ?? col.updated_at
                        };
                    }
                    return col;
                })
            );
        } catch (err) {
            console.error('Error updating column:', err);
            throw err;
        }
    };
    const removeColumn = async (columnId: string) => {
        if (!boardId) throw new Error('No board selected');

        // User confirmation
        const confirmed = window.confirm('Are you sure you want to delete this column? All cards will be deleted.');
        if (!confirmed) return;

        try {
            // Delete cards first
            const { error: cardsError } = await supabase
                .from('cards')
                .delete()
                .eq('column_id', columnId);

            if (cardsError) throw cardsError;

            // Delete column
            const { error: columnError } = await supabase
                .from('columns')
                .delete()
                .eq('id', columnId);

            if (columnError) throw columnError;

            // Update local state immediately
            setColumns(prev => {
                const filtered = prev.filter(col => col.id !== columnId);
                // Positions ko fix karo
                return filtered.map((col, index) => ({
                    ...col,
                    position: index
                }));
            });

            // Show success message (optional)
            console.log('Column deleted successfully');

        } catch (err) {
            console.error('Error removing column:', err);
            alert('Failed to delete column');
            throw err;
        }
    };
    // Add card - simple version
    const addCard = async (columnId: string, title: string): Promise<void> => {
        try {
            // ✅ Find the column first
            const column = columns.find(col => col.id === columnId);
            if (!column) throw new Error('Column not found');

            // ✅ Calculate max position in THIS column
            const maxPosition = column.cards.length > 0
                ? Math.max(...column.cards.map(card => card.position ?? 0))
                : -1;

            const { data, error } = await supabase
                .from('cards')
                .insert({
                    column_id: columnId,
                    title,
                    position: maxPosition + 1,
                    progress: 0,

                })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            const newCard: CardType = {
                id: data.id,
                title: data.title,
                description: data.description ?? undefined,
                progress: data.progress ?? 0,
                due_date: data.due_date ?? undefined,
                position: data.position ?? 0,
                column_id: data.column_id ?? undefined,
                created_at: data.created_at ?? undefined,
                updated_at: data.updated_at ?? undefined
            };

            // Add card to the correct column
            setColumns(prev =>
                prev.map(col => {
                    if (col.id === columnId) {
                        return {
                            ...col,
                            cards: [...col.cards, newCard]
                        };
                    }
                    return col;
                })
            );

        } catch (err) {
            console.error('Error adding card:', err);
            throw err;
        }
    };

    // Get cards for column
    const getCardsForColumn = (columnId: string): CardType[] => {
        const column = columns.find(col => col.id === columnId);
        return column?.cards || [];
    };


    // Delete card
    const deleteCard = async (cardId: string) => {
        
        try {
            const { error } = await supabase
                .from('cards')
                .delete()
                .eq('id', cardId);

            if (error) throw error;

            // Update local sta te
            setCards(prev => prev.filter(card => card.id !== cardId));

        } catch (err) {
            console.error('Error deleting card:', err);
            throw err;
        }
    };

    // Update card
    const updateCard = async (cardId: string, updates: any) => {
        try {
            const { error } = await supabase
                .from('cards')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', cardId);

            if (error) throw error;

            // ✅ Update card in columns state
            setColumns(prev =>
                prev.map(col => ({
                    ...col,
                    cards: col.cards.map(card =>
                        card.id === cardId
                            ? { ...card, ...updates, updated_at: new Date().toISOString() }
                            : card
                    )
                }))
            );

        } catch (err) {
            console.error('Error updating card:', err);
            throw err;
        }
    };

    return {
        columns,
        cards,
        loading,
        error,
        addColumn,
        addCard,
        moveCard,          // Full version with positioning
        moveCardSimple,    // Simple version (recommended for drag-drop)
        deleteCard,
        updateCard,
        getCardsForColumn,
        refetch: fetchData,
        removeColumn,
        updateColumn
    };
};