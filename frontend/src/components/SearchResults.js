"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SearchResults() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setRecipes([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
          }
        };
        
        const response = await fetch(`https://tasty.p.rapidapi.com/recipes/list?q=${encodeURIComponent(query)}&from=0&size=20`, options);
        const data = await response.json();
        
        setRecipes(data.results || []);
      } catch (err) {
        setError("Failed to fetch recipes");
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search results for "${query}"` : "Search Results"}
      </h1>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9cb99c]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center my-8">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="text-center my-8 text-gray-500">No recipes found for "{query}"</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="h-full">
              <div className="border border-[#e8e3d9] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <img 
                  src={recipe.thumbnail_url} 
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h2 className="font-medium text-lg mb-2">{recipe.name}</h2>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm text-gray-600">
                      {recipe.total_time_minutes ? `${recipe.total_time_minutes} mins` : "Time N/A"}
                    </span>
                    {recipe.user_ratings && (
                      <span className="bg-[#f8f5ef] px-2 py-1 rounded-full flex items-center">
                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {recipe.user_ratings.score ? (recipe.user_ratings.score * 5).toFixed(1) : 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}