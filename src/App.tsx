import './index.css';
import Column from './components/Column';
import { useAuth } from './hooks/useAuth';
import { useEffect, useState, type JSX } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core';
import { supabase } from './lib/supabase';
import { useSupabaseKanban } from './hooks/useKanban';
import AuthComponent from './components/Auth';
import { ErrorDisplay, LoadingScreen } from './components/ScreenStatus';
import { BoardSelectionScreen } from './components/BoardSelectionScreen';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export default function App(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const {
    columns,
    loading: kanbanLoading,
    error,
    addColumn,
    addCard,
    moveCardSimple,
    updateCard,
    deleteCard,
    getCardsForColumn,
    refetch,
    removeColumn,
    updateColumn
  } = useSupabaseKanban(selectedBoardId);

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  console.log(columns, 'columns');

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

      if (data && data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !selectedBoardId) return;

    const activeCardId = active.id as string;
    const overColumnId = over.id as string;

    try {
      await moveCardSimple(activeCardId, overColumnId);
    } catch (err: any) {
      console.error('Drag & drop failed:', err);
      alert(`Failed to move card: ${err.message || 'Please try again'}`);
      await refetch();
    }
  };

  // Create new board
  const handleCreateBoard = async () => {
    if (!user) return;

    const title = prompt('Enter board title:');
    if (!title?.trim()) return;

    try {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: user.id!,
        email: user.email!,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

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
  const handleAddCard = async (columnId: string, title: string) => {
    if (!selectedBoardId) return;

    try {
      await addCard(columnId, title);
    } catch (err) {
      console.error('Error adding card:', err);
      alert('Failed to add card');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading state
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Authentication required
  if (!user) {
    return <AuthComponent />;
  }

  // Board selection screen
  if (!selectedBoardId) {
    return (
      <BoardSelectionScreen
        boards={boards}
        onCreateBoard={handleCreateBoard}
        onSelectBoard={setSelectedBoardId}
        user={user}
      />
    );
  }

  // Main Kanban board
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header
        user={user}
        currentBoard={boards.find(b => b.id === selectedBoardId) || null}
        columns={columns}
        getCardsForColumn={getCardsForColumn}
        onBack={() => setSelectedBoardId(null)}
        onAddColumn={() => {
          const title = prompt('Enter column title:');
          if (title?.trim()) addColumn(title.trim());
        }}
        onLogout={handleLogout}
      />

      {error && <ErrorDisplay error={error} onRetry={refetch} />}

      <DndContext onDragEnd={handleDragEnd} sensors={[sensor]}>
        <main className="flex-1 p-4 md:p-6">
          {kanbanLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading board content...</p>
              </div>
            </div>
          ) : columns.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No columns yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Columns help you organize your workflow. Add your first column to get started.
              </p>
              <button
                onClick={() => {
                  const title = prompt('Enter column title:');
                  if (title?.trim()) addColumn(title.trim());
                }}
                className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
              >
                Add First Column
              </button>
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4">
              {columns.map(column => {
                const columnCards = getCardsForColumn(column.id);
                return (
                  <Column
                    key={column.id}
                    column={{
                      id: column.id,
                      title: column.title,
                      cards: columnCards,
                      color: column.color
                    }}
                    addCard={handleAddCard}
                    onUpdateCard={updateCard}
                    onDeleteCard={deleteCard}
                    removeColumn={removeColumn}
                    updateColumn={updateColumn}
                  />
                );
              })}

              {/* Add Column Button */}
              <div >
                <button
                  onClick={() => {
                    const title = prompt('Enter column title:');
                    if (title?.trim()) addColumn(title.trim());
                  }}
                  className="w-80 h-full  bg-white/70 backdrop-blur-sm border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-4 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg">Add Column</h3>
                  <p className="text-sm mt-2">Click to add a new column</p>
                </button>
              </div>
            </div>
          )}
        </main>
      </DndContext>

      <Footer boardId={selectedBoardId} />
    </div>
  );
}