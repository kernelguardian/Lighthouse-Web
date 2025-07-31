import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function SongDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeLanguage, setActiveLanguage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: song, isLoading, error } = useQuery({
    queryKey: ["/api/songs", id],
  });

  const { data: isFavoriteData } = useQuery({
    queryKey: ["/api/favorites", id, "check"],
    enabled: isAuthenticated,
  });

  const editForm = useForm({
    defaultValues: {
      suggestedContent: "",
      reason: "",
    },
  });

  // Set default active language when song loads
  useEffect(() => {
    if (song?.lyrics?.length > 0 && !activeLanguage) {
      const originalLyrics = song.lyrics.find(l => l.isOriginal);
      setActiveLanguage(originalLyrics?.language || song.lyrics[0].language);
    }
  }, [song, activeLanguage]);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavoriteData?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { songId: parseInt(id) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", id, "check"] });
      toast({
        title: isFavoriteData?.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavoriteData?.isFavorite 
          ? "Song removed from your favorites." 
          : "Song added to your favorites.",
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
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    },
  });

  const editSuggestionMutation = useMutation({
    mutationFn: async (data) => {
      const currentLyrics = song.lyrics.find(l => l.language === activeLanguage);
      return await apiRequest("POST", "/api/edit-suggestions", {
        songId: parseInt(id),
        lyricsId: currentLyrics?.id,
        suggestedContent: data.suggestedContent,
        reason: data.reason,
      });
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      editForm.reset();
      toast({
        title: "Edit suggestion submitted",
        description: "Your edit suggestion has been submitted for review.",
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
        description: "Failed to submit edit suggestion.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
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

  const handleEditSubmit = (data) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to suggest edits.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    editSuggestionMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-full bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Song Not Found</h1>
              <p className="text-gray-500">The song you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentLyrics = song.lyrics?.find(l => l.language === activeLanguage);
  const languageColors = {
    Malayalam: "bg-blue-100 text-blue-800",
    English: "bg-green-100 text-green-800",
    Hindi: "bg-purple-100 text-purple-800",
    Tamil: "bg-red-100 text-red-800",
    Telugu: "bg-yellow-100 text-yellow-800",
    Sanskrit: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="min-h-full bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Song Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {song.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>By {song.artist}</span>
                  <span>•</span>
                  <span>{song.viewCount || 0} views</span>
                  <span>•</span>
                  <span>Updated {new Date(song.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={languageColors[song.primaryLanguage] || "bg-gray-100 text-gray-800"}>
                    {song.primaryLanguage}
                  </Badge>
                  {song.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-6">
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  disabled={favoriteMutation.isPending}
                >
                  <i className={`${isFavoriteData?.isFavorite ? 'fas' : 'far'} fa-heart mr-2 ${
                    isFavoriteData?.isFavorite ? 'text-red-500' : ''
                  }`}></i>
                  {isFavoriteData?.isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <i className="fas fa-edit mr-2"></i>
                      Suggest Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Suggest Edit</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                      <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="suggestedContent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suggested Changes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your suggested changes to the lyrics..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Explain why you're suggesting this change..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={editSuggestionMutation.isPending}
                          >
                            Submit Suggestion
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Tabs and Lyrics */}
        <Card className="mb-6">
          {song.lyrics && song.lyrics.length > 0 ? (
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
              <div className="border-b border-gray-200">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                  {song.lyrics.map((lyrics) => (
                    <TabsTrigger
                      key={lyrics.id}
                      value={lyrics.language}
                      className="py-4 px-6 border-b-2 border-transparent data-[state=active]:border-lighthouse-500 data-[state=active]:text-lighthouse-600 rounded-none"
                    >
                      {lyrics.language} {lyrics.isOriginal && "(Original)"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {song.lyrics.map((lyrics) => (
                <TabsContent key={lyrics.id} value={lyrics.language} className="mt-0">
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <div className="text-lg leading-relaxed whitespace-pre-line">
                        {lyrics.content}
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <CardContent className="p-6 text-center text-gray-500">
              No lyrics available for this song yet.
            </CardContent>
          )}
        </Card>

        {/* Contributors */}
        {song.lyrics && song.lyrics.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributors</h3>
              <div className="space-y-3">
                {song.lyrics.map((lyrics) => (
                  lyrics.contributorId && (
                    <div key={lyrics.id} className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-lighthouse-100 flex items-center justify-center">
                        <i className="fas fa-user text-lighthouse-600 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Contributor
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {lyrics.language} {lyrics.isOriginal ? 'original' : 'translation'} • {new Date(lyrics.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
