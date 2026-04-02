// components/CardModal.tsx - Updated with direct hook usage
import { useState, useEffect, useRef } from "react";
import { X, Edit2, Send, Trash2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../lib/supabase";
import { useComments } from "../hooks/useComments";
import type { CardType, CommentType } from "../../types";

interface CardModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  card: CardType;
  onUpdateCard: (cardId: string, updates: any) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function CardModal({
  setShowModal,
  showModal,
  card,
  onUpdateCard,
  onDeleteCard,
}: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [progress, setProgress] = useState(card.progress || 0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [comments, setComments] = useState<CommentType[]>(card.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ✅ Use separate comment hook
  const { addComment, updateComment, deleteComment, commentLoading } =
    useComments();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Focus on inputs
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Update comments when card changes
  useEffect(() => {
    setComments(card.comments || []);
  }, [card.comments]);

  const handleClose = () => {
    setShowModal(false);
    setIsEditingTitle(false);
    setIsEditingDesc(false);
  };

  const handleUpdateTitle = async () => {
    if (title.trim() && title !== card.title) {
      await onUpdateCard(card.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = async () => {
    if (description !== card.description) {
      await onUpdateCard(card.id, { description: description.trim() });
    }
    setIsEditingDesc(false);
  };

  const handleUpdateProgress = async (newProgress: number) => {
    setProgress(newProgress);
    await onUpdateCard(card.id, { progress: newProgress });
  };

  // ✅ FIXED: Add Comment Handler with proper debugging
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔵 [CardModal] handleAddComment called");
    console.log("  - newComment:", newComment);
    console.log("  - card.id:", card.id);

    if (!newComment.trim()) {
      console.log("⚠️ [CardModal] Comment is empty, returning");
      return;
    }

    console.log("🟢 [CardModal] Calling addComment hook...");
    const result = await addComment(card.id, newComment);

    if (result) {
      console.log("✅ [CardModal] Comment added successfully:", result);
      // Add to local state
      setComments((prev) => [
        {
          ...result,
          created_at: result.created_at || new Date().toISOString(),
        } as unknown as CommentType,
        ...prev,
      ]);
      setNewComment(""); // Clear input
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } else {
      console.error("❌ [CardModal] Failed to add comment");
    }
  };

  const handleUpdateCommentClick = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;

    console.log("🔵 [CardModal] Updating comment:", commentId);
    const result = await updateComment(commentId, editingCommentContent);

    if (result) {
      setComments((prev) => prev.map((c) => (c.id === commentId ? result : c)));
      setEditingCommentId(null);
      setEditingCommentContent("");
    }
  };

  const handleDeleteCommentClick = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;

    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleDeleteCard = async () => {
    if (!window.confirm("Delete this card?")) return;
    await onDeleteCard(card.id);
    handleClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Card Details</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side */}

            <div className="flex-1 space-y-6">
              {/* Title */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-700">
                    {card.created_at
                      ? new Date(card.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                {card.due_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due:</span>
                    <span className="text-gray-700">
                      {new Date(card.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                    className="text-2xl font-bold w-full border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-start gap-3 group">
                    <h3 className="text-2xl font-bold text-gray-900 flex-1">
                      {card.title}
                    </h3>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress: {progress}%
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) =>
                      handleUpdateProgress(parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Description</h4>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={handleUpdateDescription}
                      placeholder="Add a description..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateDescription}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setDescription(card.description || "");
                          setIsEditingDesc(false);
                        }}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {description || (
                      <span className="text-gray-400 italic">
                        No description yet. Click edit to add one.
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Actions</h4>
                <button
                  onClick={handleDeleteCard}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-red-50 rounded-lg text-sm text-red-600 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Card
                </button>
              </div>
            </div>

            {/* Right Side - Comments */}
            <div className="lg:w-80 space-y-6">
              {/* Card Info */}

              {/* Comments Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  Discussion ({comments.length})
                </h4>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={commentLoading}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || commentLoading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {comment.profiles?.username?.[0]?.toUpperCase() ||
                              comment.profiles?.email?.[0]?.toUpperCase() || (
                                <User className="w-4 h-4" />
                              )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-2">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {comment.profiles?.username ||
                                    comment.profiles?.email?.split("@")[0] ||
                                    "User"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(
                                    new Date(comment.created_at),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              {currentUserId === comment.user_id && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditingCommentContent(comment.content);
                                    }}
                                    className="text-gray-400 hover:text-blue-600"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCommentClick(comment.id)
                                    }
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {editingCommentId === comment.id ? (
                              <div>
                                <input
                                  type="text"
                                  value={editingCommentContent}
                                  onChange={(e) =>
                                    setEditingCommentContent(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateCommentClick(comment.id);
                                    if (e.key === "Escape")
                                      setEditingCommentId(null);
                                  }}
                                  className="w-full p-1 text-sm border border-gray-300 rounded"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateCommentClick(comment.id)
                                    }
                                    className="text-xs text-blue-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="text-xs text-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
