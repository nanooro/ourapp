"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Heart, MessageCircle, Share, MoreHorizontal, ArrowLeft, Plus, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";

interface SavedPost {
  id: string;
  user_id: string;
  post_id: string;
  collection_id?: string;
  saved_at: string;
  post: {
    id: string;
    image_url: string;
    caption: string;
    author_name: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
  };
}

interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  created_at: string;
  post_count: number;
}

export default function Saved() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'collections'>('all');
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
      fetchCollections();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      // For now, create mock saved posts since we don't have a saved_posts table yet
      const mockSavedPosts: SavedPost[] = [
        {
          id: '1',
          user_id: user?.id || '',
          post_id: 'post1',
          saved_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          post: {
            id: 'post1',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            caption: 'Beautiful sunset view! 🌅 #photography',
            author_name: 'Sarah Johnson',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            likes_count: 42,
            comments_count: 8
          }
        },
        {
          id: '2',
          user_id: user?.id || '',
          post_id: 'post2',
          saved_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          post: {
            id: 'post2',
            image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
            caption: 'Delicious pasta recipe! 🍝 #food',
            author_name: 'Mike Chen',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            likes_count: 28,
            comments_count: 5
          }
        }
      ];

      setSavedPosts(mockSavedPosts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      // For now, create mock collections since we don't have a collections table yet
      const mockCollections: Collection[] = [
        {
          id: '1',
          user_id: user?.id || '',
          name: 'Travel Inspiration',
          description: 'Beautiful places I want to visit',
          cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          post_count: 15
        },
        {
          id: '2',
          user_id: user?.id || '',
          name: 'Food & Recipes',
          description: 'Delicious meals to try',
          cover_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          post_count: 8
        }
      ];

      setCollections(mockCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view saved posts</h1>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 mt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Saved</h1>
          </div>
          <Button onClick={() => setShowCreateCollection(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Collection
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            All Posts
          </Button>
          <Button
            variant={activeTab === 'collections' ? 'default' : 'outline'}
            onClick={() => setActiveTab('collections')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Collections
          </Button>
        </div>

        {/* All Saved Posts */}
        {activeTab === 'all' && (
          <>
            {savedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Bookmark className="w-16 h-16 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Saved Posts Yet</h2>
                <p className="text-gray-600 mb-4">Save posts to view them here later!</p>
                <Link href="/posts">
                  <Button>Browse Posts</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPosts.map((savedPost) => (
                  <Card key={savedPost.id} className="overflow-hidden group">
                    <div className="relative">
                      <img
                        src={savedPost.post.image_url}
                        alt="Saved post"
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button variant="secondary" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button variant="secondary" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${savedPost.post.user_id}`} />
                          <AvatarFallback className="text-xs">
                            {(savedPost.post.author_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{savedPost.post.author_name}</span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {savedPost.post.caption}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(savedPost.saved_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {savedPost.post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {savedPost.post.comments_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Collections */}
        {activeTab === 'collections' && (
          <>
            {collections.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <FolderOpen className="w-16 h-16 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Collections Yet</h2>
                <p className="text-gray-600 mb-4">Create collections to organize your saved posts!</p>
                <Button onClick={() => setShowCreateCollection(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative">
                      {collection.cover_image ? (
                        <img
                          src={collection.cover_image}
                          alt={collection.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="p-4 text-white w-full">
                          <h3 className="font-semibold text-lg">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm opacity-90">{collection.description}</p>
                          )}
                          <p className="text-sm opacity-75">{collection.post_count} posts</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Collection Modal Placeholder */}
      {showCreateCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Collection</h3>
              <p className="text-gray-600 mb-4">Collection creation feature coming soon!</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateCollection(false)}>
                  Cancel
                </Button>
                <Button>Coming Soon</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
