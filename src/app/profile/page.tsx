"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/ui/nav-bar";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Settings, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    bio: "",
    website: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setProfileImage(publicUrl);
      toast.success("Profile image uploaded successfully!");

      // Update user metadata
      await supabase.auth.updateUser({
        data: { profile_image_url: publicUrl }
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          bio: formData.bio,
          website: formData.website,
          profile_image_url: profileImage
        }
      });

      if (error) {
        console.error('Update error:', error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.user_metadata?.full_name || "",
      bio: user?.user_metadata?.bio || "",
      website: user?.user_metadata?.website || "",
    });
    setProfileImage(user?.user_metadata?.profile_image_url || null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
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
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="relative inline-block mx-auto mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={profileImage || user.user_metadata?.profile_image_url}
                  alt="Profile"
                />
                <AvatarFallback className="text-2xl">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <CardTitle className="text-2xl">
              {isEditing ? (
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="text-center text-xl font-bold border-none bg-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                user.user_metadata?.full_name || "Your Name"
              )}
            </CardTitle>
            <CardDescription>
              {user.email}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-gray-600">
                    {user.user_metadata?.bio || "No bio added yet."}
                  </p>
                </div>
                {user.user_metadata?.website && (
                  <div>
                    <h3 className="font-semibold mb-2">Website</h3>
                    <a
                      href={user.user_metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.user_metadata.website}
                    </a>
                  </div>
                )}
                <div className="flex gap-2 justify-center pt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
