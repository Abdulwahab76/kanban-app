// components/Card.tsx
import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag, CheckCircle } from 'lucide-react';
import type { CardType } from '../../types';

type CardProps = {
    card: CardType;
    columnId: string;
    onUpdate: (cardId: string, updates: any) => Promise<void>;
    onDelete: (cardId: string) => Promise<void>;
};

export default function Card({ card, onUpdate, onDelete }: CardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(card.title);
    const [editDescription, setEditDescription] = useState(card.description || '');
    const [editProgress, setEditProgress] = useState(card.progress || 0);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    console.log(card, 'card');

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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto'
    };

    const handleSave = async () => {
        if (!editTitle.trim()) return;

        try {
            setIsSaving(true);
            await onUpdate(card.id, {
                title: editTitle.trim(),
                description: editDescription.trim(),
                progress: editProgress,
                updated_at: new Date().toISOString()
            });
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving card:', err);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    // const handleDelete = async () => {
    //     try {
    //         await onDelete(card.id);
    //         setShowDeleteConfirm(false);
    //     } catch (err) {
    //         console.error('Error deleting card:', err);
    //         alert('Failed to delete card');
    //     }
    // };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            if (showDeleteConfirm) {
                setShowDeleteConfirm(false);
            } else {
                setIsEditing(false);
                setEditTitle(card.title);
                setEditDescription(card.description || '');
                setEditProgress(card.progress || 0);
            }
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const dueDate = formatDate(card.due_date);
    const createdDate = formatDate(card.created_at);

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move relative group"
            ref={setNodeRef}
            style={style}
            {...(!isEditing && listeners)}
            {...(!isEditing && attributes)}
            onKeyDown={handleKeyDown}
        >
            {/* Card Header */}
            <div className="p-4 pb-3">
                {/* Tags */}
                {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {card.tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                            >
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                        {card.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                                +{card.tags.length - 2} more
                            </span>
                        )}
                    </div>
                )}

                {/* Title Area */}
                {isEditing ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            placeholder="Card title"
                            autoFocus
                        />

                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Description (optional)"
                            rows={2}
                        />

                        {/* Progress Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Progress: {editProgress}%
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={editProgress}
                                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-right">
                                    {editProgress}%
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !editTitle.trim()}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditTitle(card.title);
                                    setEditDescription(card.description || '');
                                    setEditProgress(card.progress || 0);
                                }}
                                className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl/Cmd + Enter</kbd> to save,{' '}
                            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to cancel
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Title */}
                        <h4 className="font-medium text-gray-900 mb-2 pr-8 group-hover:text-blue-600 transition">
                            {card.title}
                        </h4>

                        {/* Description */}
                        {card.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {card.description}
                            </p>
                        )}

                        {/* Progress Bar */}
                        {card.progress !== undefined && card.progress > 0 && (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Progress</span>
                                    <span className={`font-medium ${card.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {card.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all ${card.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${card.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            {/* Left side: Avatars and metadata */}
                            <div className="flex items-center gap-3">
                                {/* Avatars */}
                                {card.avatars && card.avatars.length > 0 && (
                                    <div className="flex -space-x-2">
                                        {card.avatars.slice(0, 3).map((avatar, i) => (
                                            <img
                                                key={i}
                                                src={avatar}
                                                alt="Assignee"
                                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                title={`Assignee ${i + 1}`}
                                            />
                                        ))}
                                        {card.avatars.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600 shadow-sm">
                                                +{card.avatars.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Due Date */}
                                {dueDate && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{dueDate}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right side: Action buttons */}
                            {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500 transition"
                                    title="Edit card"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1">
                                        <span className="text-xs text-red-600 mr-1">Delete?</span>
                                        <button
                                            onClick={handleDelete}
                                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition"
                                        title="Delete card"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div> */}
                        </div>

                        {/* Created Date */}
                        {createdDate && (
                            <div className="text-xs text-gray-400 mt-2">
                                Created: {createdDate}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick Action Menu (Hover) */}
            {!isEditing && !showDeleteConfirm && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition"
                            title="Edit"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(card.id)}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}