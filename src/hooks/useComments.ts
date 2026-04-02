// // hooks/useComments.ts - SIMPLEST WORKING VERSION
// import { useState } from "react";
// import { supabase } from "../lib/supabase";
// import type { CommentType } from "../../types";

// export const useComments = () => {
//   const [commentLoading, setCommentLoading] = useState(false);

//   // hooks/useComments.ts
//   const addComment = async (cardId: string, content: string) => {
//     console.log("=== ADD COMMENT ===");
//     setCommentLoading(true);

//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) throw new Error("You must be logged in to comment");

//       // 1. Insert comment
//       const { data: commentData, error: insertError } = await supabase
//         .from("comments")
//         .insert({
//           card_id: cardId,
//           user_id: user.id,
//           content: content.trim(),
//         })
//         .select()
//         .single();

//       if (insertError) throw insertError;

//       // 2. Get user profile
//       let profileInfo = {
//         id: user.id,
//         username: user.email?.split("@")[0] || "User",
//         email: user.email || "",
//         avatar_url: undefined as string | undefined,
//       };

//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("id, username, email, avatar_url")
//         .eq("id", user.id)
//         .single();

//       if (profile) {
//         profileInfo = {
//           id: profile.id,
//           username: profile.username,
//           email: profile.email,
//           avatar_url: profile.avatar_url || undefined,
//         };
//       }

//       // 3. Return complete comment
//       const completeComment: CommentType = {
//         id: commentData.id,
//         card_id: commentData.card_id,
//         user_id: commentData.user_id,
//         content: commentData.content,
//         created_at: commentData.created_at || new Date().toISOString(),
//         updated_at: commentData.updated_at || new Date().toISOString(),
//         profiles: profileInfo,
//       };

//       console.log("✅ Comment created:", completeComment);
//       return completeComment;
//     } catch (err: any) {
//       console.error("Error:", err.message);
//       return null;
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   const updateComment = async (commentId: string, content: string) => {
//     try {
//       const { data, error } = await supabase
//         .from("comments")
//         .update({
//           content: content.trim(),
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", commentId)
//         .select()
//         .single();

//       if (error) throw error;

//       // Get profile
//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("username, email, avatar_url")
//         .eq("id", data.user_id)
//         .single();

//       return {
//         ...data,
//         profiles: profile
//           ? {
//               username: profile.username,
//               email: profile.email,
//               avatar_url: profile.avatar_url || undefined,
//             }
//           : undefined,
//       } as CommentType;
//     } catch (err) {
//       console.error("Error updating comment:", err);
//       throw err;
//     }
//   };

//   const deleteComment = async (commentId: string) => {
//     try {
//       const { error } = await supabase
//         .from("comments")
//         .delete()
//         .eq("id", commentId);

//       if (error) throw error;
//       return true;
//     } catch (err) {
//       console.error("Error deleting comment:", err);
//       throw err;
//     }
//   };

//   return {
//     addComment,
//     updateComment,
//     deleteComment,
//     commentLoading,
//   };
// };
