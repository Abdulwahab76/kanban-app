import './index.css';
import Column from './components/Column';
import { useAuth } from './hooks/useAuth';
import { useEffect, useState, type JSX } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core';
import { supabase } from './lib/supabase';
import { useSupabaseKanban } from './hooks/useKanban';
import AuthComponent from './components/Auth';

export default function App(): JSX.Element {
  // Authentication
  const { user, loading: authLoading } = useAuth();

  // Board management
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Kanban data
  const {
    board: currentBoard,
    columns,
    loading: kanbanLoading,
    error,
    addColumn,
    addCard,
    moveCardSimple, // Using the simple version
    updateCard,
    deleteCard,
    getCardsForColumn,
    refetch
  } = useSupabaseKanban(selectedBoardId);

  // DnD sensor
  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  // Fetch user's boards
  useEffect(() => {
    if (user) {
      fetchUserBoards();
    } else {
      setBoards([]);
      setSelectedBoardId(null);
    }
  }, [user]);

  const fetchUserBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .or(`owner_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);

      // Auto-select first board
      if (data && data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  // ✅ UPDATED: Handle drag end with moveCardSimple
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🎯 Drag end event:', {
      activeId: active.id,
      overId: over?.id
    });

    if (!over || !selectedBoardId) {
      console.log('No valid drop target');
      return;
    }

    const activeCardId = active.id as string;
    const overColumnId = over.id as string;

    try {
      console.log(`Moving card ${activeCardId} to column ${overColumnId}`);

      // Use the simple move function
      await moveCardSimple(activeCardId, overColumnId);

      console.log('✅ Drag & drop completed successfully');

      // Optional: Show success feedback
      // You could add a toast notification here

    } catch (err: any) {
      console.error('❌ Drag & drop failed:', err);

      // Show user-friendly error
      alert(`Failed to move card: ${err.message || 'Please try again'}`);

      // Refresh data to restore correct state
      await refetch();
    }
  };

  // Create new board
  const handleCreateBoard = async () => {
    if (!user) return;

    const title = prompt('Enter board title:');
    if (!title?.trim()) return;

    try {
      // First ensure profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id!,
          email: user.email!,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.warn('Profile warning:', profileError.message);
      }

      // Create board
      const { data, error } = await supabase
        .from('boards')
        .insert({
          title: title.trim(),
          owner_id: user.id,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      setBoards(prev => [data, ...prev]);
      setSelectedBoardId(data.id);

    } catch (err) {
      console.error('Error creating board:', err);
      alert('Failed to create board');
    }
  };

  // Add column
  const handleAddColumn = async () => {
    if (!selectedBoardId) return;

    const title = prompt('Enter column title:');
    if (!title?.trim()) return;

    try {
      await addColumn(title.trim());
    } catch (err) {
      console.error('Error adding column:', err);
      alert('Failed to add column');
    }
  };

  // Add card
  const handleAddCard = async (columnId: string, title: string) => {
    if (!selectedBoardId) return;

    try {
      await addCard(columnId, title);
    } catch (err) {
      console.error('Error adding card:', err);
      alert('Failed to add card');
    }
  };

  // Update card
  const handleUpdateCard = async (cardId: string, updates: any) => {
    try {
      await updateCard(cardId, updates);
    } catch (err) {
      console.error('Error updating card:', err);
      throw err;
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
    } catch (err) {
      console.error('Error deleting card:', err);
      throw err;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return <AuthComponent />;
  }

  // Board selection screen
  if (!selectedBoardId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Your Kanban Boards</h1>
            <p className="text-gray-600">Select a board or create a new one</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Board Card */}
            <div
              className="bg-white rounded-xl p-6 shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition"
              onClick={handleCreateBoard}
            >
              <div className="text-center py-8">
                <div className="text-4xl mb-4">+</div>
                <h3 className="font-semibold">Create New Board</h3>
              </div>
            </div>

            {/* Existing Boards */}
            {boards.map(board => (
              <div
                key={board.id}
                className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedBoardId(board.id)}
              >
                <h3 className="font-bold text-lg mb-2">{board.title}</h3>
                <p className="text-gray-600 text-sm">
                  {board.is_public ? 'Public' : 'Private'} • Created by you
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Kanban board
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedBoardId(null)}
              className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">{currentBoard?.title || 'Loading...'}</h1>
              <p className="text-sm text-gray-600">
                {columns.length} columns • {columns.reduce((sum, col) => sum + getCardsForColumn(col.id).length, 0)} cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              + Add Column
            </button>
            <div className="flex items-center gap-2">
              <img
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">{user.email?.split('@')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="max-w-7xl mx-auto mt-4 px-4">
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            Error: {error}
            <button
              onClick={() => refetch()}
              className="ml-4 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board with Drag & Drop */}
      <DndContext onDragEnd={handleDragEnd} sensors={[sensor]}>
        <div className="p-6">
          {kanbanLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading board...</div>
            </div>
          ) : columns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No columns yet. Add your first column!</p>
              <button
                onClick={handleAddColumn}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create First Column
              </button>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {columns.map(column => {
                const columnCards = getCardsForColumn(column.id);

                return (
                  <Column
                    key={column.id}
                    column={{
                      id: column.id,
                      title: column.title,
                      cards: columnCards
                    }}
                    addCard={handleAddCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                  />
                );
              })}

              {/* Add Column Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddColumn}
                  className="w-80 h-full min-h-[600px] bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500"
                >
                  <div className="text-4xl mb-4">+</div>
                  <h3 className="font-semibold">Add Column</h3>
                </button>
              </div>
            </div>
          )}
        </div>
      </DndContext>

      {/* Footer */}
      <footer className="bg-white border-t p-4 mt-8">
        <div className="max-w-7xl mx-auto text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Board ID: {selectedBoardId?.substring(0, 8)}...</span>
            <span>Drag & drop enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}