import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: popularSongs = [], isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/songs/popular", { limit: 6 }],
  });

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ["/api/favorites"],
  });

  const { data: recentActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["/api/activity", { limit: 5 }],
  });

  const handleSearch = (query) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <i className="fas fa-lighthouse text-lighthouse-600 text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back to Lighthouse Lyrics
          </h1>
          <p className="text-gray-600 mb-6">
            Your Christian songs database
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar
              placeholder="Search Christian songs, artists, or lyrics..."
              onSearch={handleSearch}
              className="text-base py-3 pl-10 pr-4 rounded-lg"
              showIcon={true}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-4 text-center hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <i className="fas fa-plus-circle text-lighthouse-600 text-2xl mb-2"></i>
              <h3 className="font-semibold text-gray-900 mb-1">Add New Song</h3>
              <p className="text-sm text-gray-500 mb-3">Contribute Christian songs</p>
              <Button size="sm" className="bg-lighthouse-600 hover:bg-lighthouse-700">
                Add Song
              </Button>
            </CardContent>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <i className="fas fa-language text-lighthouse-600 text-2xl mb-2"></i>
              <h3 className="font-semibold text-gray-900 mb-1">Add Translation</h3>
              <p className="text-sm text-gray-500 mb-3">Help translate worship songs</p>
              <Button size="sm" variant="outline">
                Browse Songs
              </Button>
            </CardContent>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <i className="fas fa-edit text-lighthouse-600 text-2xl mb-2"></i>
              <h3 className="font-semibold text-gray-900 mb-1">Suggest Edits</h3>
              <p className="text-sm text-gray-500 mb-3">Improve existing lyrics</p>
              <Button size="sm" variant="outline">
                View Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Favorites */}
        {favorites.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
              <button
                onClick={() => setLocation("/favorites")}
                className="text-lighthouse-600 hover:text-lighthouse-700 font-medium"
              >
                View all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.slice(0, 6).map((favorite) => (
                <SongCard key={favorite.id} song={favorite.song} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Songs Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Songs</h2>
            <button
              onClick={() => setLocation("/search")}
              className="text-lighthouse-600 hover:text-lighthouse-700 font-medium"
            >
              View all
            </button>
          </div>
          
          {loadingPopular ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularSongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Activity</h2>
          
          <Card>
            <CardContent className="p-0">
              {loadingActivity ? (
                <div className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-6">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No recent activity to display.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-lighthouse-100 flex items-center justify-center">
                            <i className={`fas ${
                              activity.type === 'song' ? 'fa-music' :
                              activity.type === 'lyrics' ? 'fa-language' :
                              'fa-edit'
                            } text-lighthouse-600`}></i>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.type === 'song' && `New song added: ${activity.title}`}
                            {activity.type === 'lyrics' && `Translation added in ${activity.language}`}
                            {activity.type === 'suggestion' && `Edit suggestion submitted`}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge className={
                            activity.type === 'song' ? 'bg-blue-100 text-blue-800' :
                            activity.type === 'lyrics' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {activity.type === 'song' ? 'New Song' :
                             activity.type === 'lyrics' ? 'Translation' :
                             'Edit Suggestion'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
