import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SongCard({ song }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/favorites", { songId: song.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "Song added to your favorites.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    favoriteMutation.mutate();
  };

  const languageColors = {
    Malayalam: "bg-blue-100 text-blue-800",
    English: "bg-green-100 text-green-800",
    Hindi: "bg-purple-100 text-purple-800",
    Tamil: "bg-red-100 text-red-800",
    Telugu: "bg-yellow-100 text-yellow-800",
    Sanskrit: "bg-orange-100 text-orange-800",
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              <Link 
                href={`/song/${song.id}`} 
                className="hover:text-lighthouse-600"
              >
                {song.title}
              </Link>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{song.artist}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Badge className={languageColors[song.primaryLanguage] || "bg-gray-100 text-gray-800"}>
                {song.primaryLanguage}
              </Badge>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{song.viewCount || 0} views</span>
            </div>
          </div>
          <button 
            className="ml-4 p-2 text-gray-400 dark:text-gray-500 hover:text-red-500" 
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
            title="Add to favorites"
          >
            <i className="far fa-heart"></i>
          </button>
        </div>
        
        {song.tags && song.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {song.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {song.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{song.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Updated {new Date(song.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
