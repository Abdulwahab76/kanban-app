// components/Column.tsx
import type { ColumnType } from '../../types';
import Card from './Card';
import { useState, type JSX } from 'react';
import { useDroppable } from '@dnd-kit/core';

type ColumnProps = {
    column: ColumnType;
    addCard: (columnId: string, title: string) => void;
    onStartEdit: (cardId: string, columnId: string, title: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDeleteCard: (cardId: string, columnId: string) => void;
    editMode: { cardId: string; columnId: string; isEditing: boolean } | null;
    editTitle: string;
    onEditTitleChange: (title: string) => void;
};

export default function Column({
    column,
    addCard,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDeleteCard,
    editMode,
    editTitle,
    onEditTitleChange
}: ColumnProps): JSX.Element {
    const [newTitle, setNewTitle] = useState('');
    const { setNodeRef } = useDroppable({
        id: column.id
    });

    const handleAdd = () => {
        if (newTitle.trim() === '') return;
        addCard(column.id, newTitle.trim());
        setNewTitle('');
    };

    return (
        <div className="bg-gray-100 rounded-2xl p-4 flex flex-col gap-4 w-80" ref={setNodeRef}>
            <h3 className="font-semibold text-lg">{column.title} ({column.cards.length})</h3>
            <div className="flex flex-col gap-3">
                {column.cards.map(card => (
                    <Card
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        isEditing={editMode?.cardId === card.id && editMode?.columnId === column.id}
                        editTitle={editTitle}
                        onStartEdit={onStartEdit}
                        onSaveEdit={onSaveEdit}
                        onCancelEdit={onCancelEdit}
                        onDeleteCard={onDeleteCard}
                        onEditTitleChange={onEditTitleChange}
                    />
                ))}
            </div>
            <div className="mt-auto">
                <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Add new task..."
                    className="w-full p-2 rounded-lg border border-gray-300 mb-2"
                />
                <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-1 rounded-lg hover:bg-blue-600">
                    Add
                </button>
            </div>
        </div>
    );
}