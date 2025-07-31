import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Parse query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const query = params.get('q') || '';
    setSearchQuery(query);
  }, [location]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/songs/search", { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  const handleSearch = (query) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    } else {
      setLocation('/search');
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar
              placeholder="Search Christian songs, artists, or lyrics..."
              initialValue={searchQuery}
              onSearch={handleSearch}
              className="text-base py-3 pl-10 pr-4 rounded-lg"
              showIcon={true}
            />
          </div>
          
          {searchQuery && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-500">
                {isLoading 
                  ? 'Searching...' 
                  : `${searchResults.length} results for "${searchQuery}"`
                }
              </p>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchQuery ? (
          isLoading ? (
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
          ) : searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h2>
                <p className="text-gray-500 mb-4">
                  We couldn't find any songs matching "{searchQuery}". 
                </p>
                <p className="text-sm text-gray-400">
                  Try searching with different keywords or check your spelling.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Search for Songs
              </h2>
              <p className="text-gray-500">
                Enter a Christian song title, artist name, or lyrics to start searching.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
