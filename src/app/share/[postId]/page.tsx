"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Share, Copy, Facebook, Twitter, Instagram, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Navbar from "@/components/ui/nav-bar";
import { useParams } from "next/navigation";

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

export default function SharePage() {
  const { user } = useAuth();
  const params = useParams();
  const postId = params?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (postId) {
      fetchPost();
      setShareUrl(`${window.location.origin}/posts/${postId}`);
    }
  }, [postId]);

  const fetchPost = async () => {
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

      setPost(mockPost);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post?.author_name}'s post`,
          text: post?.caption || 'Check out this post!',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`${post?.author_name}'s post: ${post?.caption || 'Check out this post!'}`);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll just copy the link
        handleCopyLink();
        return;
      default:
        return;
    }

    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to share posts</h1>
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
            <p className="text-gray-600">Loading post...</p>
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
            <Share className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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
          <h1 className="text-lg font-semibold">Share Post</h1>
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

        {/* Share Options */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Share className="w-5 h-5" />
              Share this post
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Copy Link */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {shareUrl}
                </p>
                <p className="text-xs text-gray-500">Copy link to share</p>
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="ml-3"
              >
                {copied ? (
                  <>
                    <span className="w-4 h-4 mr-2">✓</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Native Share (if supported) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full justify-start"
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                Share via...
              </Button>
            )}

            {/* Social Media Share */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Share on social media:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>

                <Button
                  onClick={() => handleSocialShare('twitter')}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-xs">Twitter</span>
                </Button>

                <Button
                  onClick={() => handleSocialShare('instagram')}
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="text-xs">Instagram</span>
                </Button>
              </div>
            </div>

            {/* Message Apps */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Share via message:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${post.author_name}'s post: ${shareUrl}`)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  variant="outline"
                  className="justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                  WhatsApp
                </Button>

                <Button
                  onClick={() => {
                    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${post.author_name}'s post`)}`;
                    window.open(telegramUrl, '_blank');
                  }}
                  variant="outline"
                  className="justify-start"
                >
                  <Send className="w-4 h-4 mr-2 text-blue-500" />
                  Telegram
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
