"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // Load shopping list from localStorage
    const storedItems = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    setItems(storedItems);
  }, []);
  
  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    localStorage.setItem('shoppingList', JSON.stringify(newItems));
  };
  
  const clearList = () => {
    setItems([]);
    localStorage.setItem('shoppingList', '[]');
  };

  // Helper function to separate quantity and ingredient
  const parseItemName = (name) => {
    // Regex to match quantity patterns like "2", "2.5", "1/2", "2 cups", etc.
    const regex = /^([\d./]+([\s-]?[a-zA-Z]+)?)?\s+(.+)$/;
    const match = name.match(regex);
    
    if (match && match[1]) {
      return {
        quantity: match[1].trim(),
        ingredient: match[3].trim()
      };
    }
    
    return {
      quantity: "",
      ingredient: name
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping List</h1>
      
      {items.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          Your shopping list is empty
        </div>
      ) : (
        <>
          <button 
            onClick={clearList}
            className="mb-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
          >
            Clear List
          </button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-[#e8e3d9]">
              {items.map((item, index) => {
                // Use the separate quantity and ingredient if they exist, otherwise parse from name
                const { quantity, ingredient } = item.quantity && item.ingredient 
                  ? { quantity: item.quantity, ingredient: item.ingredient } 
                  : parseItemName(item.name);
                
                return (
                  <li key={index} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gray-800">
                        {quantity && <span className="font-medium mr-2">{quantity}</span>}
                        <span>{ingredient}</span>
                      </p>
                      {item.recipeName && (
                        <p className="text-xs text-gray-500">
                          From: <Link href={`/recipe/${item.recipeId}`} className="text-[#9cb99c] hover:underline">
                            {item.recipeName}
                          </Link>
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-gray-500 hover:text-red-500"
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