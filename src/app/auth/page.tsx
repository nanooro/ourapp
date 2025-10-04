"use client"
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Auth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error("Login error:", error);

      // Provide specific error messages based on error type
      let errorMessage = "";
      switch (error.message) {
        case "Invalid login credentials":
          // Check if this might be because the user doesn't exist
          // Try to determine if it's a non-existent user vs wrong password
          if (formData.email && !formData.email.includes("@")) {
            // If it's not an email format, likely a non-existent user
            errorMessage = "No account found with this email address. Please sign up first.";
            setTimeout(() => {
              window.location.href = `/auth/signup?email=${encodeURIComponent(formData.email)}`;
            }, 2000);
          } else {
            errorMessage = "The email or password you entered is incorrect. Please check and try again.";
          }
          break;
        case "Email not confirmed":
          errorMessage = "Please check your email and click the confirmation link before signing in.";
          break;
        case "Too many requests":
          errorMessage = "Too many login attempts. Please wait a few minutes and try again.";
          break;
        case "User not found":
          errorMessage = "No account found with this email address. Please sign up first.";
          setTimeout(() => {
            window.location.href = `/auth/signup?email=${encodeURIComponent(formData.email)}`;
          }, 2000);
          break;
        default:
          errorMessage = "Login failed. Please check your credentials and try again.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    if (data.user) {
      console.log("Login successful:", data.user.email);
      toast.success(
        "Welcome back, " +
          (data.user.user_metadata?.full_name || data.user.email) +
          "!"
      );

      // Small delay to show toast, then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen p-2 flex flex-col justify-center items-center relative bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <Card className="w-full max-w-md p-8 flex flex-col justify-center items-center gap-6 bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl shadow-black/10 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Sign in to{" "}
          <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Insta-clone
          </span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email, username or phone number"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-white"
          />
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">
                    Login Failed
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    {error}
                  </p>
                  {error.includes("email") && (
                    <p className="text-red-600 text-xs mt-2">
                      💡 Make sure you&apos;re using the correct email address
                    </p>
                  )}
                  {error.includes("password") && (
                    <p className="text-red-600 text-xs mt-2">
                      💡 Check your password or try resetting it
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setError("")}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-4 w-full">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        <Link href="/auth/signup">
          <span className="text-blue-500 font-medium cursor-pointer">
            Don&apos;t have an account? <span className="underline">Sign up</span>
          </span>
        </Link>
      </Card>
    </div>
  );
}
