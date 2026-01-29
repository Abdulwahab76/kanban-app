// components/Column.tsx
import Card from './Card';
import { useState, type JSX } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical, X } from 'lucide-react';
import type { ColumnType } from '../../types';

type ColumnProps = {
    column: ColumnType;
    addCard: (columnId: string, title: string) => Promise<void>;
    onUpdateCard: (cardId: string, updates: any) => Promise<void>;
    onDeleteCard: (cardId: string) => Promise<void>;
    removeColumn: (columnId: string) => Promise<void>;
    updateColumn: (
        columnId: string,
        updates: Partial<ColumnType>
    ) => Promise<void>
};

export default function Column({
    column,
    addCard,
    onUpdateCard,
    onDeleteCard,
    removeColumn,
    updateColumn
}: ColumnProps): JSX.Element {
    const [newTitle, setNewTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const { setNodeRef, isOver } = useDroppable({
        id: column.id
    });

    const handleAdd = async () => {
        if (newTitle.trim() === '') return;

        try {
            setIsAdding(true);
            await addCard(column.id, newTitle.trim());
            setNewTitle('');
            setIsAdding(false);
        } catch (err) {
            console.error('Error adding card:', err);
            alert('Failed to add card');
            setIsAdding(false);
        } finally {
            setIsAdding(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
        if (e.key === 'Escape') {
            setNewTitle('');
            setIsAdding(false);
        }
    };

    const handleUpdateCard = async (cardId: string, updates: any) => {
        try {
            await onUpdateCard(cardId, updates);
        } catch (err) {
            console.error('Error updating card:', err);
            throw err;
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await onDeleteCard(cardId);
        } catch (err) {
            console.error('Error deleting card:', err);
            alert('Failed to delete card');
        }
    };
    const handleUpdateColumn = async (value: string) => {
        console.log(value, 'vale==');
        if (value.startsWith('#')) { // Update color                 
            try {
                await updateColumn(column.id, {
                    color: value
                });

                setShowColorPicker(false);
            } catch (err) {
                console.error('Error updating column color:', err);
                alert('Failed to update column color');
            }
            return;
        }
        const newTitle = prompt('Enter new column title:', column.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            try {
                await updateColumn(column.id, {
                    title: newTitle.trim()
                });
            } catch (err) {
                console.error('Error updating column:', err);
                alert('Failed to update column');
            }
        }

    }
    const columnColor = column.color;

    return (
        <div
            ref={setNodeRef}
            className={`w-80 rounded-2xl bg-gray-200 flex flex-col transition-all ${isOver ? 'scale-[1.02]' : ''}`}
        >

            {/* Column Header */}
            <div
                className="rounded-t-2xl p-4 flex justify-between items-center relative"
                style={{ backgroundColor: columnColor }}
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate text-gray-900">
                        {column.title}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                        {column.cards.length} card{column.cards.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-1 hover:bg-white/20 rounded-lg transition"
                    >
                        <MoreVertical className="w-5 h-5 text-gray-700" />
                    </button>

                    {showOptions && (
                        <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 z-20 w-48">
                            <button onClick={() => handleUpdateColumn('')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                                Edit Column
                            </button>
                            <button onClick={() => setShowColorPicker(prev => !prev)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                                Change Color
                            </button>
                            <button onClick={() => removeColumn(column.id)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t border-gray-200">
                                Delete Column
                            </button>
                        </div>
                    )}

                    {showColorPicker && (
                        <div className='absolute right-0 top-10 z-50 bg-white shadow-xl p-3 rounded-lg border border-gray-200 w-52'>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Column Color</span>
                                <button onClick={() => setShowColorPicker(false)} className="text-gray-400 hover:text-gray-600">
                                    ×
                                </button>
                            </div>

                            <input
                                type="color"
                                value={column.color || '#e5e7eb'}
                                onChange={(e) => handleUpdateColumn(e.target.value)}
                                className="w-full h-10 mb-3 cursor-pointer"
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleUpdateColumn(color)}
                                        className="w-full aspect-square rounded hover:scale-105 transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpdateColumn('#e5e7eb')}
                                className="w-full mt-2 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Default Color
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Cards Container */}
            <div className={`flex-1 bg-gray-50/50 py-4 rounded-b-2xl flex flex-col gap-3  max-h-[calc(100vh-200px)] overflow-y-auto ${isOver ? 'bg-blue-50/50' : ''}`}>
                {column.cards.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-center">No cards yet</p>
                        <p className="text-sm text-center mt-1">Add your first card below</p>
                    </div>
                ) : (
                    column.cards.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            columnId={column.id}
                            onUpdate={handleUpdateCard}
                            onDelete={handleDeleteCard}
                        />
                    ))
                )}

                {/* Add Card Form */}
                <div className="mt-auto pt-4">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add a card
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Enter a title for this card..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                autoFocus
                            />

                            <div className="flex items-center justify-between mt-3">
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewTitle('');
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title="Cancel"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewTitle('');
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newTitle.trim()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isAdding ? 'Add Card' : 'Add Card'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to save,{' '}
                                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}