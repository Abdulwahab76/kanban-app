// contexts/KanbanContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import type { CardType, ColumnType, CommentType } from "../../types";

// Define Context Type
interface KanbanContextType {
  columns: ColumnType[];
  loading: boolean;
  error: string | null;
  addColumn: (title: string) => Promise<void>;
  addCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: any) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (
    cardId: string,
    targetColumnId: string,
    newPosition?: number
  ) => Promise<void>;
  moveCardSimple: (
    cardId: string,
    targetColumnId: string,
    newPosition?: number
  ) => Promise<void>;
  removeColumn: (columnId: string) => Promise<void>;
  updateColumn: (
    columnId: string,
    updates: { title?: string; color?: string; position?: number }
  ) => Promise<void>;
  refetch: () => Promise<void>;
  // ✅ Add comment update helper
  updateCardComments: (cardId: string, newComment: CommentType) => void;
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  getCardsForColumn: (columnId: string) => CardType[];
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within KanbanProvider");
  }
  return context;
};

// Provider Component
export const KanbanProvider = ({
  children,
  boardId,
}: {
  children: React.ReactNode;
  boardId: string | null;
}) => {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Helper: Update card comments (for real-time UI update)
  const updateCardComments = useCallback(
    (cardId: string, newComment: CommentType) => {
      console.log("🔄 Updating card comments in context:", cardId);

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  comments: [newComment, ...(card.comments || [])],
                }
              : card
          ),
        }))
      );
    },
    []
  );
  const getCardsForColumn = (columnId: string): CardType[] => {
    const column = columns.find((col) => col.id === columnId);
    return column?.cards || [];
  };
  // Fetch Data
  const fetchData = useCallback(async () => {
    if (!boardId) {
      setColumns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select(
          `
                    *,
                    cards (
                        *,
                        comments (
                            *,
                            profiles!comments_user_id_fkey (
                                id,
                                username,
                                email,
                                avatar_url
                            )
                        )
                    )
                `
        )
        .eq("board_id", boardId)
        .order("position");

      if (columnsError) throw columnsError;

      const typedColumns: ColumnType[] = (columnsData || []).map(
        (column: any) => {
          const cardsArray = Array.isArray(column.cards) ? column.cards : [];

          const sortedCards: CardType[] = cardsArray
            .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
            .map((card: any) => ({
              id: card.id,
              title: card.title,
              description: card.description ?? "",
              progress: card.progress ?? 0,
              due_date: card.due_date ?? undefined,
              position: card.position ?? 0,
              column_id: card.column_id ?? column.id,
              created_at: card.created_at ?? "",
              updated_at: card.updated_at ?? "",
              comments: (card.comments || [])
                .map((comment: any) => ({
                  id: comment.id,
                  card_id: comment.card_id,
                  user_id: comment.user_id,
                  content: comment.content,
                  created_at: comment.created_at,
                  updated_at: comment.updated_at,
                  profiles: comment.profiles
                    ? {
                        id: comment.profiles.id,
                        username: comment.profiles.username,
                        email: comment.profiles.email,
                        avatar_url: comment.profiles.avatar_url || undefined,
                      }
                    : undefined,
                }))
                .sort(
                  (a: any, b: any) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                ),
            }));

          return {
            id: column.id,
            title: column.title,
            color: column.color ?? "#e5e7eb",
            position: column.position ?? 0,
            board_id: column.board_id ?? undefined,
            created_at: column.created_at ?? undefined,
            updated_at: column.updated_at ?? undefined,
            cards: sortedCards,
          };
        }
      );

      setColumns(typedColumns);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Move Card Function
  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string, newPosition?: number) => {
      try {
        const cardToMove = cards.find((c) => c.id === cardId);
        if (!cardToMove) throw new Error("Card not found");

        const sourceColumnId = cardToMove.column_id;

        if (sourceColumnId === targetColumnId) {
          const columnCards = cards
            .filter((c) => c.column_id === targetColumnId && c.id !== cardId)
            .sort((a, b) => a.position - b.position);

          const position = newPosition || columnCards.length + 1;
          const updates = [];

          updates.push(
            supabase
              .from("cards")
              .update({ position, updated_at: new Date().toISOString() })
              .eq("id", cardId)
          );

          let currentPos = 1;
          for (const card of columnCards) {
            if (currentPos === position) currentPos++;
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: currentPos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            currentPos++;
          }

          await Promise.all(updates);
        } else {
          const sourceColumnCards = cards
            .filter((c) => c.column_id === sourceColumnId && c.id !== cardId)
            .sort((a, b) => a.position - b.position);

          const targetColumnCards = cards
            .filter((c) => c.column_id === targetColumnId)
            .sort((a, b) => a.position - b.position);

          const position = newPosition || targetColumnCards.length + 1;
          const updates = [];

          let sourcePos = 1;
          for (const card of sourceColumnCards) {
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: sourcePos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            sourcePos++;
          }

          let targetPos = 1;
          for (const card of targetColumnCards) {
            if (targetPos === position) {
              updates.push(
                supabase
                  .from("cards")
                  .update({
                    column_id: targetColumnId,
                    position: targetPos,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", cardId)
              );
              targetPos++;
            }
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: targetPos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            targetPos++;
          }

          if (position > targetColumnCards.length) {
            updates.push(
              supabase
                .from("cards")
                .update({
                  column_id: targetColumnId,
                  position,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", cardId)
            );
          }

          await Promise.all(updates);
        }

        await fetchData();
      } catch (err) {
        console.error("Error moving card:", err);
        throw err;
      }
    },
    [cards, fetchData]
  );

  const moveCardSimple = useCallback(
    async (cardId: string, targetColumnId: string, newPosition?: number) => {
      try {
        let cardToMove: CardType | null = null;
        let sourceColumnId = "";

        for (const column of columns) {
          const foundCard = column.cards.find((c) => c.id === cardId);
          if (foundCard) {
            cardToMove = foundCard;
            sourceColumnId = column.id;
            break;
          }
        }

        if (!cardToMove) throw new Error("Card not found");

        if (sourceColumnId === targetColumnId) {
          const sourceColumn = columns.find((col) => col.id === sourceColumnId);
          if (!sourceColumn) throw new Error("Source column not found");

          const columnCards = sourceColumn.cards.filter((c) => c.id !== cardId);
          const position = newPosition || columnCards.length + 1;
          const updates = [];

          updates.push(
            supabase
              .from("cards")
              .update({ position, updated_at: new Date().toISOString() })
              .eq("id", cardId)
          );

          let currentPos = 1;
          for (const card of columnCards) {
            if (currentPos === position) currentPos++;
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: currentPos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            currentPos++;
          }

          await Promise.all(updates);

          setColumns((prev) =>
            prev.map((col) => {
              if (col.id === sourceColumnId) {
                const updatedCards = col.cards
                  .map((card) =>
                    card.id === cardId ? { ...card, position } : card
                  )
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                return { ...col, cards: updatedCards };
              }
              return col;
            })
          );
        } else {
          const sourceColumn = columns.find((col) => col.id === sourceColumnId);
          const targetColumn = columns.find((col) => col.id === targetColumnId);
          if (!sourceColumn || !targetColumn)
            throw new Error("Column not found");

          const sourceColumnCards = sourceColumn.cards.filter(
            (c) => c.id !== cardId
          );
          const targetColumnCards = targetColumn.cards;
          const position = newPosition || targetColumnCards.length + 1;
          const updates = [];

          let sourcePos = 1;
          for (const card of sourceColumnCards) {
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: sourcePos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            sourcePos++;
          }

          updates.push(
            supabase
              .from("cards")
              .update({
                column_id: targetColumnId,
                position,
                updated_at: new Date().toISOString(),
              })
              .eq("id", cardId)
          );

          let targetPos = 1;
          for (const card of targetColumnCards) {
            if (targetPos === position) targetPos++;
            updates.push(
              supabase
                .from("cards")
                .update({
                  position: targetPos,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", card.id)
            );
            targetPos++;
          }

          await Promise.all(updates);

          setColumns((prev) => {
            const updatedColumns = prev.map((col) => {
              if (col.id === sourceColumnId) {
                return {
                  ...col,
                  cards: col.cards
                    .filter((c) => c.id !== cardId)
                    .map((card, index) => ({ ...card, position: index + 1 })),
                };
              }
              if (col.id === targetColumnId) {
                const newCards = [...col.cards];
                const movedCard = {
                  ...cardToMove,
                  column_id: targetColumnId,
                  position,
                };
                newCards.splice(position - 1, 0, movedCard);
                const recalculatedCards = newCards.map((card, index) => ({
                  ...card,
                  position: index + 1,
                }));
                return { ...col, cards: recalculatedCards };
              }
              return col;
            });
            return updatedColumns;
          });
        }
      } catch (err) {
        console.error("Error moving card:", err);
        throw err;
      }
    },
    [columns]
  );

  // Add Column
  const addColumn = async (title: string) => {
    if (!boardId) throw new Error("No board selected");

    try {
      const maxPosition = Math.max(...columns.map((c) => c.position ?? 0), 0);
      const { data, error } = await supabase
        .from("columns")
        .insert({
          board_id: boardId,
          title,
          position: maxPosition + 1,
          color: "#e5e7eb",
        })
        .select()
        .single();

      if (error) throw error;

      const newColumn: ColumnType = {
        id: data.id,
        title: data.title,
        cards: [],
        color: data.color ?? "#e5e7eb",
        position: data.position,
        board_id: data.board_id ?? undefined,
        created_at: data.created_at ?? undefined,
        updated_at: data.updated_at ?? undefined,
      };

      setColumns((prev) => [...prev, newColumn]);
    } catch (err) {
      console.error("Error adding column:", err);
      throw err;
    }
  };

  // Update Column
  const updateColumn = async (
    columnId: string,
    updates: { title?: string; color?: string; position?: number }
  ) => {
    if (!boardId) throw new Error("No board selected");

    try {
      const { data, error } = await supabase
        .from("columns")
        .update(updates)
        .eq("id", columnId)
        .select()
        .single();

      if (error) throw error;

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                ...updates,
                updated_at: data.updated_at ?? col.updated_at,
              }
            : col
        )
      );
    } catch (err) {
      console.error("Error updating column:", err);
      throw err;
    }
  };

  // Remove Column
  const removeColumn = async (columnId: string) => {
    if (!boardId) throw new Error("No board selected");

    const confirmed = window.confirm(
      "Are you sure you want to delete this column? All cards will be deleted."
    );
    if (!confirmed) return;

    try {
      await supabase.from("cards").delete().eq("column_id", columnId);
      await supabase.from("columns").delete().eq("id", columnId);

      setColumns((prev) => {
        const filtered = prev.filter((col) => col.id !== columnId);
        return filtered.map((col, index) => ({ ...col, position: index }));
      });
    } catch (err) {
      console.error("Error removing column:", err);
      alert("Failed to delete column");
      throw err;
    }
  };

  // Add Card
  const addCard = async (columnId: string, title: string) => {
    try {
      const column = columns.find((col) => col.id === columnId);
      if (!column) throw new Error("Column not found");

      const maxPosition =
        column.cards.length > 0
          ? Math.max(...column.cards.map((card) => card.position ?? 0))
          : -1;

      const { data, error } = await supabase
        .from("cards")
        .insert({
          column_id: columnId,
          title,
          position: maxPosition + 1,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newCard: CardType = {
        id: data.id,
        title: data.title,
        description: data.description ?? undefined,
        progress: data.progress ?? 0,
        due_date: data.due_date ?? undefined,
        position: data.position ?? 0,
        column_id: data.column_id ?? undefined,
        created_at: data.created_at ?? undefined,
        updated_at: data.updated_at ?? undefined,
      };

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
        )
      );
    } catch (err) {
      console.error("Error adding card:", err);
      throw err;
    }
  };

  // Delete Card
  const deleteCard = async (cardId: string) => {
    try {
      await supabase.from("cards").delete().eq("id", cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error("Error deleting card:", err);
      throw err;
    }
  };

  // Update Card
  const updateCard = async (cardId: string, updates: any) => {
    try {
      await supabase
        .from("cards")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", cardId);

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId
              ? { ...card, ...updates, updated_at: new Date().toISOString() }
              : card
          ),
        }))
      );
    } catch (err) {
      console.error("Error updating card:", err);
      throw err;
    }
  };

  const value = {
    columns,
    loading,
    error,
    addColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    moveCardSimple,
    removeColumn,
    updateColumn,
    refetch: fetchData,
    updateCardComments,
    setColumns,
    getCardsForColumn,
  };

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};
