// components/CardModal.tsx - COMPLETE WORKING VERSION
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Edit2, Send, Trash2, User, Calendar } from "lucide-react";
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
  onCardUpdate?: (updatedCard: CardType) => void; // ✅ Optional callback to update parent
  onAddComment: any;
  onUpdateComment: any;
  onDeleteComment: any;
  onUpdateCardComments: any;
}

export default function CardModal({
  setShowModal,
  showModal,
  card,
  onUpdateCard,
  onDeleteCard,
  onCardUpdate,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onUpdateCardComments,
}: CardModalProps) {
  // Local state for card data
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [progress, setProgress] = useState(card.progress || 0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentType[]>(card.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { addComment, updateComment, deleteComment } = useComments();
  console.log(comments, "comm");

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

  // ✅ Notify parent when comments change (to update card in parent state)
  const updateParentCard = useCallback(() => {
    if (onCardUpdate) {
      const updatedCard = {
        ...card,
        comments: comments,
      };
      onCardUpdate(updatedCard);
    }
  }, [card, comments, onCardUpdate]);

  // Call parent update whenever comments change
  // useEffect(() => {
  //   if (comments !== card.comments) {
  //     updateParentCard();
  //   }
  // }, [comments, card.comments, updateParentCard]);

  const handleClose = () => {
    setShowModal(false);
    setIsEditingTitle(false);
    setIsEditingDesc(false);
    setEditingCommentId(null);
    setNewComment("");
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

  // ✅ FIXED: Add Comment Handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    console.log("🔵 Adding comment for card:", card.id);

    try {
      const result = await addComment(card.id, newComment);

      if (result) {
        const formattedComment: CommentType = {
          ...result,
          created_at: result.created_at || new Date().toISOString(),
        };
        // ✅ Update parent card via context
        onUpdateCardComments(card.id, result);
        // 1. Update local state
        setComments((prev) => [formattedComment, ...prev]);
        setNewComment("");

        // 2. ✅ CRITICAL: Update parent component's card
        const updatedCard = {
          ...card,
          comments: [formattedComment, ...(card.comments || [])],
        };

        // Call parent update functions
        if (onCardUpdate) {
          onCardUpdate(updatedCard);
        }

        console.log("✅ Comment added and parent updated");
      }
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      alert("Failed to add comment");
    }
  };

  // ✅ Update Comment Handler
  const handleUpdateCommentClick = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;

    console.log("🔵 Updating comment:", commentId);
    setLoading(true);

    try {
      const result = await updateComment(commentId, editingCommentContent);

      if (result) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...result, updated_at: new Date().toISOString() }
              : c
          )
        );
        setEditingCommentId(null);
        setEditingCommentContent("");
      }
    } catch (error) {
      console.error("❌ Error updating comment:", error);
      alert("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Comment Handler
  const handleDeleteCommentClick = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;

    console.log("🔵 Deleting comment:", commentId);
    setLoading(true);

    try {
      const success = await deleteComment(commentId);

      if (success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("❌ Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!window.confirm("Delete this card? This action cannot be undone."))
      return;
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
            {/* LEFT SIDE - Main Content */}
            <div className="flex-1 space-y-6">
              {/* Title */}
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
                    <h3 className="text-2xl font-bold text-gray-900 flex-1 break-words">
                      {card.title}
                    </h3>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Progress
                  </label>
                  <span
                    className={`text-sm font-medium ${progress === 100 ? "text-green-600" : "text-blue-600"}`}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) =>
                      handleUpdateProgress(parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
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
                      placeholder="Add a more detailed description..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateDescription}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setDescription(card.description || "");
                          setIsEditingDesc(false);
                        }}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap break-words">
                    {description || (
                      <span className="text-gray-400 italic">
                        No description yet. Click edit to add one.
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Card Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Details
                </h4>
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
              </div>

              {/* Delete Card Button */}
              <button
                onClick={handleDeleteCard}
                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Card
              </button>
            </div>

            {/* RIGHT SIDE - Comments Section */}
            <div className="lg:w-96 space-y-6">
              {/* Comments Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
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
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || loading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No comments yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Be the first to start the discussion
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 group">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {comment.profiles?.username?.[0]?.toUpperCase() ||
                              comment.profiles?.email?.[0]?.toUpperCase() ||
                              comment.user_id?.slice(0, 2).toUpperCase() || (
                                <User className="w-4 h-4" />
                              )}
                          </div>
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-2 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm text-gray-900">
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
                                {comment.updated_at !== comment.created_at && (
                                  <span className="text-xs text-gray-400">
                                    (edited)
                                  </span>
                                )}
                              </div>

                              {currentUserId === comment.user_id && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditingCommentContent(comment.content);
                                    }}
                                    className="text-gray-400 hover:text-blue-600 p-0.5"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCommentClick(comment.id)
                                    }
                                    className="text-gray-400 hover:text-red-600 p-0.5"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {editingCommentId === comment.id ? (
                              <div className="mt-2">
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
                                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handleUpdateCommentClick(comment.id)
                                    }
                                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
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
