"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/nav-bar";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  isFollowing?: boolean;
}

export default function Search() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user?.id);

      if (error) {
        console.error("Error:", error);
        return;
      }

      const followingIds = data.map((f) => f.following_id);
      setFollowing(new Set(followingIds));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, avatar_url, bio, followers_count")
        .ilike("username", `%${searchQuery}%`)
        .or("ilike", "full_name", `%${searchQuery}%`);

      if (error) {
        toast.error("Failed to search users");
        return;
      }

      const filteredUsers = data.filter(
        (u) => u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string, username: string) => {
    if (!user) return;
      const { data, error } = await supabase
        .from("follows")
        .insert({ user_id: user.id, following_id: targetUserId });

      if (error) {
        console.error("Error:", error);
        return;
      }

      setFollowing((prev) => new Set([...prev, targetUserId]));
      toast.success(`You are now following ${username}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to follow ${username}`);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to search</h1>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Navbar />
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 mt-14">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Discover Users</h1>
        </div>
      </div>

      {/* Search Input */}
      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          {searchResults.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link href={`/profile/${user.username}`}>
                      <p className="font-semibold">{user.full_name}</p>
                    </Link>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-600">{user.bio}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant={following.has(user.id) ? "outline" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleFollow(user.id, user.username)}
                >
                  {following.has(user.id) ? "Following" : "Follow"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <SearchIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Search for Users</h2>
          <p className="text-gray-600">
            Enter a username or name to start searching.
          </p>
        </Card>
      )}
    </div>
  );
}
