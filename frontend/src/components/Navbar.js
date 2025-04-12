"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Logo from "../../public/Logo.png"; // Adjust the path as necessary
import LogoMobile from "../../public/LogoMobile.png"; // Adjust the path as necessary

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSearchResults(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
        }
      };
      
      const response = await fetch(`https://tasty.p.rapidapi.com/recipes/list?q=${encodeURIComponent(query)}&from=0&size=3`, options);
      const data = await response.json();
      
      setSearchResults(data.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSeeAllResults = () => {
    setShowDropdown(false); // Close the dropdown
  };

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-[#faf7f2] border-b border-[#e8e3d9]">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center">
            <div className="w-fit h-fit p-2 rounded-md flex items-center justify-center">
              {/* Regular Logo - Hidden on small devices, visible on medium and up */}
              <div className="hidden md:block">
                <Image 
                  src={Logo} 
                  alt="PriceByte Logo" 
                  width={140} 
                  height={20}
                  className="text-white"
                />
              </div>
              
              {/* Mobile Logo - Visible on small devices, hidden on medium and up */}
              <div className="block md:hidden">
                <Image 
                  src={LogoMobile} 
                  alt="PriceByte Logo" 
                  width={40} 
                  height={40}
                  className="text-white"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="search"
            className="block w-full py-2 pl-10 pr-3 text-sm text-gray-700 border border-[#e8e3d9] rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#9cb99c]"
            placeholder="Search for meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#9cb99c]"></div>
            </div>
          )}
        </div>

        {/* Dropdown Search Results */}
        {showDropdown && searchResults.length > 0 && (
          <div 
            ref={dropdownRef} 
            className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-[#e8e3d9] overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-[#e8e3d9] flex justify-between items-center">
              <span className="text-sm font-medium">Top Results</span>
              <Link 
                href={`/search?q=${encodeURIComponent(searchQuery)}`} 
                className="text-xs text-[#9cb99c] hover:underline"
                onClick={handleSeeAllResults}
              >
                See all results
              </Link>
            </div>
            <div>
              {searchResults.map(recipe => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <div className="flex items-center p-3 hover:bg-[#f8f5ef] transition-colors">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={recipe.thumbnail_url} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{recipe.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>
                          {recipe.total_time_minutes ? `${recipe.total_time_minutes} mins` : "Time N/A"}
                        </span>
                        {recipe.user_ratings?.score && (
                          <span className="flex items-center ml-2">
                            <svg className="w-3 h-3 text-yellow-500 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {(recipe.user_ratings.score * 5).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification and User Icons */}
      <div className="flex items-center gap-4">
        {/* Notification Bell
        <button className="p-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </button>
         */}
        {/* User Profile */}
        <button className="w-8 h-8 rounded-full bg-[#9cb99c] flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>
      </div>
    </nav>
  );
}