"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, MoreHorizontal, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";

interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  caption: string;
  author_name: string;
  avatar_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function Reels() {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReel, setCurrentReel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      // For demo purposes, create mock reels with avatar data
      const mockReels: Reel[] = [
        {
          id: '1',
          user_id: 'user1',
          video_url: '',
          caption: ' Beautiful sunset at the beach! 🏖️',
          author_name: 'Sarah Johnson',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          likes_count: 42,
          comments_count: 8
        },
        {
          id: '2',
          user_id: 'user2',
          video_url: '',
          caption: 'Cooking my favorite pasta recipe 🍝',
          author_name: 'Mike Chen',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes_count: 28,
          comments_count: 5
        },
        {
          id: '3',
          user_id: 'user3',
          video_url: '',
          caption: 'Morning workout motivation! 💪',
          author_name: 'Emma Wilson',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          likes_count: 67,
          comments_count: 12
        }
      ];

      setReels(mockReels);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('reel_id', reelId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('reel_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('reel_id', reelId);

        setReels(prev => prev.map(reel =>
          reel.id === reelId
            ? { ...reel, likes_count: Math.max(0, reel.likes_count - 1) }
            : reel
        ));
      } else {
        // Like
        await supabase
          .from('reel_likes')
          .insert({
            user_id: user.id,
            reel_id: reelId
          });

        setReels(prev => prev.map(reel =>
          reel.id === reelId
            ? { ...reel, likes_count: reel.likes_count + 1 }
            : reel
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view reels</h1>
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

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Reels Yet</h2>
          <p className="text-gray-600">Be the first to share a reel!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white text-xl font-bold">
              Reels
            </Link>
            <Button variant="ghost" size="sm" className="text-white">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reels Container */}
      <div className="pt-16 h-screen overflow-hidden">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="absolute inset-0 bg-black flex items-center justify-center"
            style={{
              transform: `translateY(${index * 100}%)`,
              transition: currentReel === index ? 'transform 0.3s ease-in-out' : 'none'
            }}
          >
            {/* Video Container */}
            <div className="relative w-full h-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
              {/* Video Placeholder (since we don't have actual video upload yet) */}
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Video Content</p>
                  <p className="text-sm opacity-75">{reel.caption}</p>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-white hover:bg-white/20 p-2"
                  onClick={() => handleLike(reel.id)}
                >
                  <Heart className="w-6 h-6" />
                  <span className="text-xs">{reel.likes_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-white hover:bg-white/20 p-2"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs">{reel.comments_count}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-white hover:bg-white/20 p-2"
                >
                  <Share className="w-6 h-6" />
                </Button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-4 left-4 right-16">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={reel.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user_id}`} />
                    <AvatarFallback>
                      {(reel.author_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      {reel.author_name || 'Unknown User'}
                    </p>
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                      {reel.caption}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Indicator */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentReel ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
