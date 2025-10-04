"use client";

import { useState } from "react";
import Navbar from "@/components/ui/nav-bar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, Video, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Create() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caption: "",
    image: null as File | null,
    isReel: false,
    location: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Please select an image or video file");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Please select an image or video");
      return;
    }

    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, formData.image);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload file");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      // Save post to database
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id,
          image_url: publicUrl,
          caption: formData.caption,
          author_name: user?.user_metadata?.full_name || user?.email,
        });

      if (insertError) {
        toast.error("Failed to create post");
        return;
      }

      toast.success("Post created successfully!");

      // Reset form
      setFormData({ caption: "", image: null, isReel: false, location: "" });

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create posts</h1>
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
          <h1 className="text-lg font-semibold">Create Post</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Share a moment</CardTitle>
            <CardDescription>
              Upload a photo or video to share with your followers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="file-upload">Photo or Video</Label>
                <div className="mt-2">
                  <input
                    id="file-upload"
                    name="image"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {formData.image ? (
                        <>
                          <div className="text-sm text-gray-900 mb-2">
                            Selected: {formData.image.name}
                          </div>
                          <Button type="button" variant="outline" size="sm">
                            Change File
                          </Button>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-12 h-12 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 50MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Caption */}
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  placeholder="Write a caption..."
                  value={formData.caption}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Post Type Toggle */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="post"
                    name="postType"
                    checked={!formData.isReel}
                    onChange={() => setFormData(prev => ({ ...prev, isReel: false }))}
                  />
                  <Label htmlFor="post">Post</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="reel"
                    name="postType"
                    checked={formData.isReel}
                    onChange={() => setFormData(prev => ({ ...prev, isReel: true }))}
                  />
                  <Label htmlFor="reel">Reel</Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.image}
              >
                {loading ? "Creating..." : "Share Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
