"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const removeFromFavorites = (id) => {
    const updatedFavorites = favorites.filter(recipe => recipe.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Favorite Recipes</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          You don't have any favorite recipes yet.
          <div className="mt-4">
            <Link href="/search" className="text-[#9cb99c] hover:underline">
              Search for recipes to add to your favorites
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                {recipe.thumbnail_url ? (
                  <img 
                    src={recipe.thumbnail_url} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2">{recipe.name}</h2>
                  <button 
                    onClick={() => removeFromFavorites(recipe.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove from favorites"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  {recipe.total_time_minutes && (
                    <div className="mb-1">
                      <span className="font-medium">Time:</span> {recipe.total_time_minutes} minutes
                    </div>
                  )}
                  {recipe.user_ratings && (
                    <div>
                      <span className="font-medium">Rating:</span> {recipe.user_ratings.score ? 
                        `${(recipe.user_ratings.score * 5).toFixed(1)} / 5` : 
                        'No ratings'}
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/recipe/${recipe.id}`}
                  className="mt-4 inline-block bg-[#9cb99c] hover:bg-[#8aa98a] text-white py-2 px-4 rounded-md transition-colors"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}