// components/Card.tsx
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { Edit2, Trash2, Calendar, CheckCircle } from "lucide-react";
import type { CardType, CommentType } from "../../types";
import CardModal from "./CardModal";

type CardProps = {
  card: CardType;
  columnId: string;
  onUpdate: (cardId: string, updates: any) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
};

export default function Card({ card, onUpdate, onDelete }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(
    card.description || ""
  );
  const [editProgress, setEditProgress] = useState(card.progress || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      disabled: isEditing,
    });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    try {
      setIsSaving(true);
      await onUpdate(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        progress: editProgress,
        updated_at: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(card.id);
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete card");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(card.title);
      setEditDescription(card.description || "");
      setEditProgress(card.progress || 0);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const dueDate = formatDate(card.due_date);
  const createdDate = formatDate(card.created_at);
  const commentCount = card.comments?.length || 0;

  // ✅ Handle modal open/close
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Card Preview */}
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group relative ${
          isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        ref={setNodeRef}
        style={style}
        {...(!isEditing && listeners)}
        {...(!isEditing && attributes)}
        onKeyDown={handleKeyDown}
      >
        <div className="p-4 pb-3">
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
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(card.title);
                    setEditDescription(card.description || "");
                    setEditProgress(card.progress || 0);
                  }}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">
                  Ctrl/Cmd + Enter
                </kbd>{" "}
                to save,{" "}
                <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to
                cancel
              </p>
            </div>
          ) : (
            <>
              {/* Clickable area to open modal */}
              <div onClick={handleOpenModal} className="cursor-pointer">
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
                      <span
                        className={`font-medium ${
                          card.progress === 100
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {card.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          card.progress === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${card.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{dueDate}</span>
                      </div>
                    )}

                    {/* Comment Count */}
                    {commentCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{commentCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Created Date */}
                {createdDate && (
                  <div className="text-xs text-gray-400 mt-2">
                    Created: {createdDate}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Quick Action Menu (Hover) */}
        {!isEditing && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Card Modal with all props */}
      {showModal && (
        <CardModal
          setShowModal={setShowModal}
          showModal={showModal}
          card={card}
          onUpdateCard={onUpdate}
          onDeleteCard={onDelete}
        />
      )}
    </>
  );
}
