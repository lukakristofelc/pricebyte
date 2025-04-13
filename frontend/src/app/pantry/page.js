"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Pantry() {
  const [pantryItems, setPantryItems] = useState([]);

  useEffect(() => {
    // Load pantry items from localStorage
    const storedItems = JSON.parse(localStorage.getItem('pantryItems') || '[]');
    setPantryItems(storedItems);
  }, []);

  const removeItem = (index) => {
    const newItems = [...pantryItems];
    newItems.splice(index, 1);
    setPantryItems(newItems);
    localStorage.setItem('pantryItems', JSON.stringify(newItems));
  };

  const clearPantry = () => {
    setPantryItems([]);
    localStorage.setItem('pantryItems', '[]');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Pantry</h1>
      
      {pantryItems.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          Your pantry is empty. Items you purchase will appear here.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <button 
              onClick={clearPantry}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
            >
              Clear Pantry
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-[#e8e3d9]">
              {pantryItems.map((item, index) => {
                // Check if the item has quantity and ingredient separately or in a single name
                const displayName = item.ingredient ? 
                  (item.quantity ? `${item.quantity} ${item.ingredient}` : item.ingredient) : 
                  item.name;
                
                return (
                  <li key={index} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800">{displayName}</p>
                      {item.recipeName && (
                        <p className="text-xs text-gray-500">
                          From: <Link href={`/recipe/${item.recipeId}`} className="text-[#9cb99c] hover:underline">
                            {item.recipeName}
                          </Link>
                        </p>
                      )}
                      {item.productTitle && (
                        <p className="text-xs text-gray-500">
                          Product: {item.productTitle} - {item.productPrice}
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-gray-500 hover:text-red-500 ml-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}