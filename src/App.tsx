// App.tsx
import './index.css';
import Column from './components/Column';
import { useKanban } from './hooks/useKanban';
import type { JSX } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor } from '@dnd-kit/core';

export default function App(): JSX.Element {
  const {
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
  } = useKanban();
  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id as string;
    const overColumnId = over.id as string;

    moveCard(activeCardId, overColumnId);
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={[sensor]}>
      <div className="min-h-screen bg-slate-100 p-6 flex gap-6 overflow-x-auto justify-center items-center md:flex-row flex-col">
        {Object.values(data.columns).map(column => (
          <Column
            key={column.id}
            column={column}
            addCard={addCard}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onDeleteCard={deleteCard}
            editMode={editMode}
            editTitle={editTitle}
            onEditTitleChange={setEditTitle}
          />
        ))}
      </div>
    </DndContext>
  );
}