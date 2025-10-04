"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";
import { useParams } from "next/navigation";

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
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

export default function LikesPage() {
  const { user } = useAuth();
  const params = useParams();
  const postId = params?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserLiked, setCurrentUserLiked] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPostAndLikes();
    }
  }, [postId]);

  const fetchPostAndLikes = async () => {
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

      // Mock likes data
      const mockLikes: Like[] = [
        {
          id: '1',
          post_id: postId,
          user_id: 'user2',
          user_name: 'Mike Chen',
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user2`,
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
          id: '2',
          post_id: postId,
          user_id: 'user3',
          user_name: 'Emma Wilson',
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user3`,
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        },
        {
          id: '3',
          post_id: postId,
          user_id: 'user4',
          user_name: 'Alex Rodriguez',
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user4`,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '4',
          post_id: postId,
          user_id: 'user5',
          user_name: 'Lisa Park',
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user5`,
          created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
        },
        {
          id: '5',
          post_id: postId,
          user_id: 'user6',
          user_name: 'David Kim',
          user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user6`,
          created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString()
        }
      ];

      setPost(mockPost);
      setLikes(mockLikes);

      // Check if current user liked this post
      if (user) {
        setCurrentUserLiked(mockLikes.some(like => like.user_id === user.id));
      }
    } catch (error) {
      console.error('Error fetching post and likes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view likes</h1>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading likes...</p>
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
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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
          <h1 className="text-lg font-semibold">Likes</h1>
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

        {/* Likes Section */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              Liked by {likes.length} {likes.length === 1 ? 'person' : 'people'}
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {likes.length === 0 ? (
              <div className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No likes yet. Be the first to like this post!</p>
              </div>
            ) : (
              <div className="divide-y">
                {likes.map((like) => (
                  <div key={like.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={like.user_avatar} />
                        <AvatarFallback>
                          {like.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{like.user_name}</p>
                        <p className="text-xs text-gray-500">
                          Liked {new Date(like.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {like.user_id === user.id && (
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
