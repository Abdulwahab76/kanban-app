// components/Card.tsx
import type { JSX } from "react";
import type { CardType } from "../../types";
import { useDraggable } from '@dnd-kit/core';

type CardProps = {
    card: CardType;
    columnId: string;
    isEditing: boolean;
    editTitle: string;
    onStartEdit: (cardId: string, columnId: string, title: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDeleteCard: (cardId: string, columnId: string) => void;
    onEditTitleChange: (title: string) => void;
};

export default function Card({
    card,
    columnId,
    isEditing,
    editTitle,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDeleteCard,
    onEditTitleChange
}: CardProps): JSX.Element {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: card.id,
        disabled: isEditing
    });

    const style = {
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.5 : 1
    };

    // Fix: Handle delete with confirmation
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
            onDeleteCard(card.id, columnId);
        }
        console.log('detle');

    };

    const handleStartEdit = (e: React.MouseEvent) => {
        // e.stopPropagation();
        e.preventDefault();
        onStartEdit(card.id, columnId, card.title);
    };

    return (
        <div
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer relative group"
            ref={setNodeRef}
            style={style}
            {...(!isEditing && listeners)}
            {...(!isEditing && attributes)}
        >
            {/* Edit/Delete buttons - Show on hover or always */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleStartEdit}
                    className="text-sm bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                    title="Edit"
                    type="button"
                >
                    ✏️
                </button>
                <button
                    onClick={handleDelete}
                    className="text-sm bg-gray-100 hover:bg-red-100 hover:text-red-600 p-1.5 rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                    title="Delete"
                    type="button"
                >
                    🗑️
                </button>
            </div>

            {card.tags && card.tags.length > 0 && (
                <div className="flex gap-1 mb-2">
                    {card.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-gray-200">{tag}</span>
                    ))}
                </div>
            )}

            {isEditing ? (
                // Edit mode
                <div className="mt-6" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => onEditTitleChange(e.target.value)}
                        className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveEdit();
                            if (e.key === 'Escape') onCancelEdit();
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={onSaveEdit}
                            className="flex-1 bg-blue-500 text-white py-1.5 rounded   focus:outline-none"
                            type="button"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="flex-1 bg-gray-300 py-1.5 rounded hover:bg-gray-400 focus:outline-none"
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // View mode
                <>
                    <p className="font-medium mt-6 pr-10">{card.title}</p>
                    {card.progress !== undefined && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 h-2 rounded-full">
                                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${card.progress}%` }} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{card.progress}%</p>
                        </div>
                    )}
                    {card.avatars && card.avatars.length > 0 && (
                        <div className="flex -space-x-2 mt-3">
                            {card.avatars.map((avatar, i) => (
                                <img
                                    key={i}
                                    src={avatar}
                                    alt={`Avatar ${i}`}
                                    className="w-6 h-6 rounded-full border-2 border-white"
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}