"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash, Heart, MessageCircle, Share, MoreHorizontal, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";

interface HashtagPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  author_name: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  hashtags: string[];
}

export default function Hashtags() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<HashtagPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    // Mock trending hashtags
    const mockHashtags = [
      'photography', 'travel', 'food', 'fitness', 'art', 'music',
      'nature', 'fashion', 'technology', 'lifestyle'
    ];
    setTrendingHashtags(mockHashtags);
  };

  const searchHashtags = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // For now, create mock posts with the searched hashtag
      const mockPosts: HashtagPost[] = [
        {
          id: '1',
          user_id: 'user1',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          caption: `Amazing ${searchQuery} shot! #${searchQuery} #photography #travel`,
          author_name: 'Sarah Johnson',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          likes_count: 42,
          comments_count: 8,
          hashtags: [searchQuery, 'photography', 'travel']
        },
        {
          id: '2',
          user_id: 'user2',
          image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
          caption: `Beautiful ${searchQuery} view from the mountains #${searchQuery} #nature #adventure`,
          author_name: 'Mike Chen',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes_count: 28,
          comments_count: 5,
          hashtags: [searchQuery, 'nature', 'adventure']
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error searching hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag);
    searchHashtags();
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to explore hashtags</h1>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Explore Hashtags</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && searchHashtags()}
              />
            </div>
            <Button onClick={searchHashtags} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Card>

        {/* Trending Hashtags */}
        {!searchQuery && (
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Trending Hashtags</h2>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((hashtag) => (
                <Button
                  key={hashtag}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleHashtagClick(hashtag)}
                >
                  #{hashtag}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Search Results */}
        {searchQuery && (
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Posts with #{searchQuery}
            </h2>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <Hash className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No posts found for #{searchQuery}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    {/* Post Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
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
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Post Image */}
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

                    {/* Post Actions */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                          onClick={() => window.open(`/likes/${post.id}`, '_blank')}
                        >
                          <Heart className="w-5 h-5" />
                          <span>{post.likes_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                          onClick={() => window.open(`/comments/${post.id}`, '_blank')}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
                          onClick={() => window.open(`/share/${post.id}`, '_blank')}
                        >
                          <Share className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Caption with Hashtags */}
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">
                            {post.author_name || 'Unknown User'}
                          </span>
                          {post.caption.split(' ').map((word, index) => {
                            if (word.startsWith('#')) {
                              return (
                                <span key={index}>
                                  <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => handleHashtagClick(word.slice(1))}
                                  >
                                    {word}
                                  </button>
                                  {' '}
                                </span>
                              );
                            }
                            return <span key={index}>{word} </span>;
                          })}
                        </p>

                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()} at{' '}
                          {new Date(post.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
