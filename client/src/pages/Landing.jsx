import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: popularSongs = [], isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/songs/popular", { limit: 6 }],
  });

  const { data: recentActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["/api/activity", { limit: 5 }],
  });

  const handleSearch = (query) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const languages = [
    { name: "Malayalam", color: "bg-blue-100 text-blue-800" },
    { name: "English", color: "bg-green-100 text-green-800" },
    { name: "Hindi", color: "bg-purple-100 text-purple-800" },
    { name: "Tamil", color: "bg-red-100 text-red-800" },
    { name: "Telugu", color: "bg-yellow-100 text-yellow-800" },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <i className="fas fa-lighthouse text-lighthouse-600 text-6xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Lighthouse Lyrics</span>
              <span className="block text-lighthouse-600 text-3xl sm:text-4xl md:text-5xl mt-2">
                Christian Songs Database
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              Discover and explore Christian song lyrics in multiple languages. Search, contribute, and build a comprehensive database of worship songs, hymns, and contemporary Christian music.
            </p>
            
            {/* Featured Search */}
            <div className="mt-10 max-w-xl mx-auto">
              <SearchBar
                placeholder="Try searching for 'Amazing Grace' or 'How Great Thou Art'..."
                onSearch={handleSearch}
                className="text-lg py-4 pl-12 pr-4 rounded-xl shadow-lg"
                showIcon={true}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {languages.map((lang) => (
                  <Badge
                    key={lang.name}
                    className={`${lang.color} px-3 py-1 text-sm font-medium`}
                  >
                    {lang.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Songs Section */}
        <div className="mt-16">
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
