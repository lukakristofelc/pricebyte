"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  const fetchRandomRecipes = async () => {
    setLoading(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
        }
      };

      // Fetch a larger set of recipes and then randomly select from them
      const response = await fetch('https://tasty.p.rapidapi.com/recipes/list?from=0&size=40&tags=dinner', options);
      const data = await response.json();

      if (!data.results) {
        throw new Error('No recipes found');
      }

      // Randomly select 6 recipes from the results
      const shuffledRecipes = data.results.sort(() => 0.5 - Math.random());
      const selectedRecipes = shuffledRecipes.slice(0, 6);
      setRecipes(selectedRecipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to PriceByte</h1>
        <p className="text-xl text-gray-600">Discover delicious recipes and find the best prices for ingredients</p>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9cb99c]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center my-12">{error}</div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-8">Featured Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map(recipe => (
              <Link 
                key={recipe.id} 
                href={`/recipe/${recipe.id}`}
                className="group h-full"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative h-48">
                    <img
                      src={recipe.thumbnail_url}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg mb-2 group-hover:text-[#9cb99c] transition-colors line-clamp-2">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-auto">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {recipe.total_time_minutes ? `${recipe.total_time_minutes} mins` : "Time N/A"}
                      </span>
                      {recipe.user_ratings?.score && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="text-center mt-8">
            <button
              onClick={fetchRandomRecipes}
              className="bg-[#9cb99c] hover:bg-[#8aa98a] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Show More Recipes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
