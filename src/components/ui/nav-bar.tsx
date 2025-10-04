import { Heart, House, Search, Squircle, Plus, Clapperboard, User, MessageCircle, Camera, LogOut, Bookmark } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex p-3 gap-6 justify-center items-center h-14 max-w-screen-sm mx-auto">
          <h1 className="font-pacifico text-3xl text-gray-900">Insta-clone</h1>
          <Link href="saved">
            <Bookmark size={24} className="cursor-pointer hover:text-yellow-500 transition-colors text-gray-700" />
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex p-3 gap-10 justify-center items-center h-14 max-w-screen-sm mx-auto">
          <Link href="/">
            <House size={28} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
          </Link>
          <Link href="search">
            <Search size={28} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
          </Link>
          <Link href="stories">
            <Camera size={28} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
          </Link>
          <Link href="create">
            <div className="relative inline-block hover:scale-110 transition-transform cursor-pointer">
              <Squircle size={28} className="text-gray-700" />
              <Plus
                size={14}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              />
            </div>
          </Link>
          <div className="flex gap-8">
            <Link href="reels">
              <Clapperboard size={28} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="profile">
                  <User size={26} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
                </Link>
                <button
                  onClick={signOut}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                  title="Sign out"
                >
                  <LogOut size={18} className="text-gray-700" />
                </button>
              </div>
            ) : (
              <Link href="auth">
                <User size={26} className="hover:scale-110 transition-transform cursor-pointer text-gray-700" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-14"></div>
    </>
  );
}

export default Navbar;
