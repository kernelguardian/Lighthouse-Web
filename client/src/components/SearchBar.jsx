import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  className = "", 
  showIcon = false,
  initialValue = ""
}) {
  const [query, setQuery] = useState(initialValue);
  const [showResults, setShowResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/songs/search", { q: query }],
    enabled: query.length >= 2 && showResults,
  });

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      if (value.length >= 2) {
        // Search results will be fetched by React Query
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setShowResults(false);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {showIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
          )}
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "block w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-lighthouse-500 focus:border-lighthouse-500 sm:text-sm",
              showIcon ? "pl-10 pr-4 py-2" : "px-4 py-2",
              className
            )}
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {searchResults.slice(0, 8).map((result) => (
                <Link
                  key={result.id}
                  href={`/song/${result.id}`}
                  onClick={handleResultClick}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {result.artist}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {result.primaryLanguage}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.viewCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {searchResults.length > 8 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-sm text-lighthouse-600 hover:text-lighthouse-700 font-medium"
                  >
                    View all {searchResults.length} results
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
