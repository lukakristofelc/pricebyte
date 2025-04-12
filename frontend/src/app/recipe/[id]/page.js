"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
          <h1 className="text-3xl font-bold mb-4">{recipe.name}</h1>
          
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