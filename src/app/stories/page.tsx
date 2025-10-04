"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Plus, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption?: string;
  created_at: string;
  expires_at: string;
  author_name: string;
  author_avatar?: string;
}

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      // mock stories until DB exists
      const mockStories: Story[] = [
        {
          id: "1",
          user_id: "user1",
          media_url:
            "https://images.unsplash.com/photo-1539650116574-75c0c6d73b0e?w=400&h=600&fit=crop",
          media_type: "image",
          caption: "Beautiful sunset! 🌅",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 24
          ).toISOString(),
          author_name: "Sarah Johnson",
          author_avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "2",
          user_id: "user2",
          media_url:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop",
          media_type: "image",
          caption: "Coffee time ☕",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 22
          ).toISOString(),
          author_name: "Mike Chen",
          author_avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
      ];

      setStories(mockStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view stories
          </h1>
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Stories
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        {stories.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Camera className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Stories Yet</h2>
            <p className="text-gray-600 mb-4">
              Share your moments with stories that disappear in 24 hours!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Story
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* User's Story (Add Story) */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-2 border-gray-300">
                    <AvatarImage
                      src={user.user_metadata?.profile_image_url}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg">
                      {user.user_metadata?.full_name?.charAt(0) ||
                        user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Your Story</p>
                  <p className="text-sm text-gray-600">Share a photo or video</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Stories List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Recent Stories</h3>
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-gradient-to-r from-purple-400 to-pink-400">
                        <AvatarImage src={story.author_avatar} />
                        <AvatarFallback>
                          {story.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {story.author_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(story.created_at).toLocaleDateString()} at{" "}
                        {new Date(story.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Story Modal - Coming Soon */}
      {/* <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={fetchStories}
      /> */}
    </div>
  );
}
