// src/routes/_authenticated/boards.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BoardSelectionScreen } from '../../components/BoardSelectionScreen';
import type { Database } from "../../lib/database.types";
type BoardRow =
  Database['public']['Tables']['boards']['Row']

export const Route = createFileRoute('/_authenticated/boards')({
  component: BoardsComponent,
});

export function BoardsComponent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch boards whenever user changes
  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('boards')
          .select('*')
          .or(`owner_id.eq.${user.id},is_public.eq.true`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBoards(data || []);

        if (data && data.length > 0 && !selectedBoardId) {
          setSelectedBoardId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching boards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [user]);

  const handleCreateBoard = async () => {
    if (!user) return;

    const title = prompt('Enter board title:');
    if (!title?.trim()) return;

    try {
      if (user.id && user.email) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } else {
        console.error('User ID or email is undefined');
        throw new Error('User ID or email is required to upsert profile');
      }

      const { data, error } = await supabase
        .from('boards')
        .insert({
          title: title.trim(),
          owner_id: user.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      setBoards((prev) => [data, ...prev]);
      setSelectedBoardId(data.id);
      navigate({ to: '/board/$boardId', params: { boardId: data.id } });
    } catch (err) {
      console.error('Error creating board:', err);
      alert('Failed to create board');
    }
  };

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
    navigate({ to: '/board/$boardId', params: { boardId } });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BoardSelectionScreen
      boards={boards}
      onCreateBoard={handleCreateBoard}
      onSelectBoard={handleSelectBoard}
      user={user!}
    />
  );
}
