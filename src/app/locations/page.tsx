"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Heart, MessageCircle, Share, MoreHorizontal, ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";

interface LocationPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  author_name: string;
  location_name: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function Locations() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<LocationPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularLocations, setPopularLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchPopularLocations();
  }, []);

  const fetchPopularLocations = async () => {
    // Mock popular locations
    const mockLocations = [
      'New York, NY', 'Los Angeles, CA', 'Miami, FL', 'Chicago, IL',
      'San Francisco, CA', 'Las Vegas, NV', 'Austin, TX', 'Nashville, TN'
    ];
    setPopularLocations(mockLocations);
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // For now, create mock posts with the searched location
      const mockPosts: LocationPost[] = [
        {
          id: '1',
          user_id: 'user1',
          image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
          caption: `Amazing views in ${searchQuery}! What a beautiful city 🏙️`,
          author_name: 'Sarah Johnson',
          location_name: searchQuery,
          location_lat: 40.7128,
          location_lng: -74.0060,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          likes_count: 42,
          comments_count: 8
        },
        {
          id: '2',
          user_id: 'user2',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          caption: `Exploring ${searchQuery} - such incredible architecture! ✨`,
          author_name: 'Mike Chen',
          location_name: searchQuery,
          location_lat: 40.7128,
          location_lng: -74.0060,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes_count: 28,
          comments_count: 5
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location: string) => {
    setSearchQuery(location);
    searchLocations();
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to explore locations</h1>
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
          <h1 className="text-lg font-semibold">Explore Locations</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
              />
            </div>
            <Button onClick={searchLocations} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Card>

        {/* Popular Locations */}
        {!searchQuery && (
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Popular Locations</h2>
            <div className="grid grid-cols-2 gap-3">
              {popularLocations.map((location) => (
                <Button
                  key={location}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{location}</span>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Search Results */}
        {searchQuery && (
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Posts from {searchQuery}
              </h2>
            </div>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No posts found for {searchQuery}</p>
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
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{post.location_name}</span>
                          </div>
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
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          <span>{post.likes_count}</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments_count}</span>
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Share className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Caption */}
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold mr-2">
                            {post.author_name || 'Unknown User'}
                          </span>
                          {post.caption}
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
