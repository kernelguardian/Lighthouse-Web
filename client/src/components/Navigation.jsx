import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <i className="fas fa-lighthouse text-lighthouse-600 text-2xl mr-3"></i>
              <div className="text-xl font-bold text-lighthouse-900 dark:text-white">Lighthouse Lyrics</div>
            </Link>
          </div>



          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
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
                  <Button
                    onClick={handleSignIn}
                    className="bg-lighthouse-600 hover:bg-lighthouse-700"
                  >
                    Sign In
                  </Button>
                )}
              </>
            )}
          </div>
        </div>


      </div>
    </nav>
  );
}
