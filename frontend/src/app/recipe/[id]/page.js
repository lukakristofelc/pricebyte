"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToList, setAddingToList] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteAdded, setFavoriteAdded] = useState(false);
  
  const { id } = useParams();
  
  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true);
      try {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'tasty.p.rapidapi.com'
          }
        };
        
        const response = await fetch(`https://tasty.p.rapidapi.com/recipes/get-more-info?id=${id}`, options);
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError("Failed to load recipe details");
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchRecipe();
    }
  }, [id]);
  
  // Check if recipe is in favorites when page loads
  useEffect(() => {
    if (recipe) {
      const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
      const isInFavorites = favorites.some(fav => fav.id === recipe.id);
      setIsFavorite(isInFavorites);
    }
  }, [recipe]);

  const addToFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav.id !== recipe.id);
      localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      setFavoriteAdded(false);
    } else {
      // Add to favorites
      const recipeToSave = {
        id: recipe.id,
        name: recipe.name,
        thumbnail_url: recipe.thumbnail_url,
        total_time_minutes: recipe.total_time_minutes,
        user_ratings: recipe.user_ratings
      };
      const updatedFavorites = [...favorites, recipeToSave];
      localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      
      // Show success message
      setFavoriteAdded(true);
      setTimeout(() => setFavoriteAdded(false), 3000);
    }
  };

  const addIngredientsToShoppingList = async () => {
    setAddingToList(true);
    try {
      const allIngredients = [];
      
      recipe.sections?.forEach(section => {
        section.components?.forEach(component => {
          allIngredients.push({
            name: component.raw_text,
            recipeId: recipe.id,
            recipeName: recipe.name
          });
        });
      });
      
      const currentList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
      const updatedList = [...currentList, ...allIngredients];
      localStorage.setItem('shoppingList', JSON.stringify(updatedList));
      
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      console.error("Error adding to shopping list:", err);
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9cb99c]"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-red-500 my-8">{error || "Recipe not found"}</div>
        <Link href="/search" className="text-[#9cb99c] hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link href="/search" className="text-[#9cb99c] hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to search
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={recipe.thumbnail_url} 
          alt={recipe.name} 
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{recipe.name}</h1>
            <button 
              onClick={addToFavorites}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                className="w-8 h-8" 
                fill={isFavorite ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>
          </div>
          
          {favoriteAdded && (
            <div className="mb-4 p-2 bg-pink-100 text-pink-800 rounded-md">
              Recipe added to favorites!
            </div>
          )}
          
          <button
            onClick={addIngredientsToShoppingList}
            disabled={addingToList}
            className="mb-6 bg-[#9cb99c] hover:bg-[#8aa98a] text-white py-2 px-4 rounded-md flex items-center transition-colors disabled:opacity-50"
          >
            {addingToList ? (
              <span>Adding...</span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add ingredients to shopping list
              </>
            )}
          </button>
          
          {addSuccess && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md">
              Ingredients added to shopping list!
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mb-6">
            {recipe.total_time_minutes && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.total_time_minutes} minutes</span>
              </div>
            )}
            
            {recipe.num_servings && (
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{recipe.num_servings} servings</span>
              </div>
            )}
          </div>
          
          {recipe.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{recipe.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc ml-5 space-y-2">
              {recipe.sections?.map((section, idx) => (
                <div key={idx}>
                  {section.name && <h3 className="font-medium mt-3 mb-1">{section.name}</h3>}
                  {section.components?.map((component, i) => (
                    <li key={i} className="text-gray-700">{component.raw_text}</li>
                  ))}
                </div>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal ml-5 space-y-4">
              {recipe.instructions?.map((step, i) => (
                <li key={i} className="text-gray-700">{step.display_text}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}