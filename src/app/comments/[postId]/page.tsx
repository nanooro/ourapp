"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";
import { useParams } from "next/navigation";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  author_name: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function CommentsPage() {
  const { user } = useAuth();
  const params = useParams();
  const postId = params?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const fetchPostAndComments = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      // Mock post data
      const mockPost: Post = {
        id: postId,
        user_id: 'user1',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        caption: 'Amazing photography shot! #photography #travel',
        author_name: 'Sarah Johnson',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes_count: 42,
        comments_count: 8
      };

      // Mock comments data
      const mockComments: Comment[] = [
        {
          id: '1',
          post_id: postId,
          user_id: 'user2',
          content: 'This is absolutely stunning! 😍',
          author_name: 'Mike Chen',
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: '2',
          post_id: postId,
          user_id: 'user3',
          content: 'Great composition and lighting!',
          author_name: 'Emma Wilson',
          created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
        },
        {
          id: '3',
          post_id: postId,
          user_id: 'user4',
          content: 'Love this! Where was this taken?',
          author_name: 'Alex Rodriguez',
          created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
        }
      ];

      setPost(mockPost);
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching post and comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !postId) return;

    setSubmitting(true);
    try {
      // Mock adding comment
      const comment: Comment = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: user.id,
        content: newComment,
        author_name: user.user_metadata?.full_name || 'Anonymous',
        created_at: new Date().toISOString()
      };

      setComments(prev => [...prev, comment]);
      setNewComment("");

      // Update post comments count
      if (post) {
        setPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view comments</h1>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Post not found</p>
            <Button asChild className="mt-4">
              <Link href="/hashtags">Back to Hashtags</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 mt-12">
        <div className="flex items-center gap-4">
          <Link href="/hashtags">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Comments</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        {/* Post Preview */}
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
              <AvatarFallback>
                {(post.author_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author_name || 'Unknown User'}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="aspect-square bg-gray-100">
            {post.image_url ? (
              <img
                src={post.image_url}
                alt="Post"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <p className="text-gray-500">No image</p>
              </div>
            )}
          </div>

          <div className="p-4">
            <p className="text-sm">
              <span className="font-semibold mr-2">{post.author_name || 'Unknown User'}</span>
              {post.caption}
            </p>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              Comments ({comments.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="divide-y">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} />
                        <AvatarFallback>
                          {(comment.author_name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{comment.author_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Comment */}
        <Card>
          <form onSubmit={handleSubmitComment} className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                <AvatarFallback>
                  {(user.user_metadata?.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
