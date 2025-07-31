import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (query) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <i className="fas fa-lighthouse text-lighthouse-600 text-2xl mr-3"></i>
              <div className="text-xl font-bold text-lighthouse-900">Lighthouse Lyrics</div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar
              placeholder="Search Christian songs, artists, or lyrics..."
              onSearch={handleSearch}
              className="w-full"
              showIcon={true}
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Toggle */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <i className="fas fa-search"></i>
            </button>

            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <Link href="/favorites" className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100" title="Favorites">
                      <i className="fas fa-heart"></i>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                          {user?.profileImageUrl ? (
                            <img 
                              className="h-8 w-8 rounded-full object-cover" 
                              src={user.profileImageUrl} 
                              alt="User avatar"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-lighthouse-100 flex items-center justify-center">
                              <i className="fas fa-user text-lighthouse-600 text-sm"></i>
                            </div>
                          )}
                          <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <i className="fas fa-user mr-2"></i>
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites" className="flex items-center">
                            <i className="fas fa-heart mr-2"></i>
                            My Favorites
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/my-contributions" className="flex items-center">
                            <i className="fas fa-music mr-2"></i>
                            My Contributions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                          <i className="fas fa-sign-out-alt mr-2"></i>
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      onClick={handleSignIn}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleSignIn}
                      className="bg-lighthouse-600 hover:bg-lighthouse-700"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pb-4">
            <SearchBar
              placeholder="Search Christian songs, artists, or lyrics..."
              onSearch={handleSearch}
              className="w-full"
              showIcon={true}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
