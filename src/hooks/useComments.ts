import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { CommentType } from "../../types";

export const useComments = () => {
  const [commentLoading, setCommentLoading] = useState(false);

  // Add Comment - Working version
  // hooks/useComments.ts - Updated working version
  const addComment = async (cardId: string, content: string) => {
    console.log("=== ADD COMMENT ===");

    setCommentLoading(true);

    try {
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to comment");
      }

      console.log("User:", user.id);

      // 2. Insert comment
      const { data: commentData, error: insertError } = await supabase
        .from("comments")
        .insert({
          card_id: cardId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("Comment inserted:", commentData);

      // 3. Get user profile - FIXED
      let profileInfo = {
        id: user.id,
        username: user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar_url: undefined as string | undefined,
      };

      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, email, avatar_url, full_name")
          .eq("id", user.id)
          .single();

        if (!profileError && profile) {
          profileInfo = {
            id: profile.id,
            username: profile.username || profileInfo.username,
            email: profile.email || profileInfo.email,
            avatar_url: profile.avatar_url || undefined,
          };
        }
      } catch (err) {
        console.log("Profile fetch error, using default:", err);
      }

      // 4. Return complete comment
      const completeComment: CommentType = {
        id: commentData.id,
        card_id: commentData.card_id,
        user_id: commentData.user_id,
        content: commentData.content,
        created_at: commentData.created_at || "",
        updated_at: commentData.updated_at || "",
        profiles: profileInfo,
      };

      console.log("✅ Comment with profile:", completeComment);
      return completeComment;
    } catch (err: any) {
      console.error("Error:", err.message);
      alert(`Failed: ${err.message}`);
      return null;
    } finally {
      setCommentLoading(false);
    }
  };

  // Update Comment
  const updateComment = async (commentId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;

      // Get profile for this comment
      let profileInfo = undefined;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, email, avatar_url")
          .eq("id", data.user_id)
          .single();

        if (profile) {
          profileInfo = {
            username: profile.username,
            email: profile.email,
            avatar_url: profile.avatar_url || undefined,
          };
        }
      } catch (err) {}

      return { ...data, profiles: profileInfo } as CommentType;
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  };

  // Delete Comment
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  };

  return {
    addComment,
    updateComment,
    deleteComment,
    commentLoading,
  };
};
