"use client";
import Image from "next/image";
import Navbar from "@/components/ui/nav-bar";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center text-4xl">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Navbar />
      <div className="flex flex-col items-center gap-8 mt-16">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Welcome to Insta-clone!</h1>
          <p className="text-gray-600 mb-6">
            Hello {user.user_metadata?.full_name || user.email}!
            <br />
            Your Instagram clone is ready to use.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
            <Link href="/posts">
              <Button variant="outline">Browse Posts</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
