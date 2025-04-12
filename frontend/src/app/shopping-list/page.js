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

  // Enhanced helper function to separate quantity and ingredient
  const parseItemName = (name) => {
    if (!name) return { quantity: "", ingredient: "" };
    
    // Trim and normalize the input
    const trimmedName = name.trim();
    
    // Common cooking units - this helps identify where quantity ends
    const units = [
      'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 
      'teaspoon', 'teaspoons', 'tsp', 'oz', 'ounce', 'ounces',
      'pound', 'pounds', 'lb', 'lbs', 'gram', 'grams', 'g',
      'kg', 'kilogram', 'kilograms', 'ml', 'milliliter', 'milliliters',
      'l', 'liter', 'liters', 'pinch', 'pinches', 'dash', 'dashes',
      'handful', 'handfuls', 'slice', 'slices', 'piece', 'pieces',
      'can', 'cans', 'bottle', 'bottles', 'clove', 'cloves'
    ];
    
    // Regex for matching numbers (including fractions and unicode fractions)
    const numberPattern = /^([\d.,½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\/[\d.,]+)?(?:\s*-\s*[\d.,½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?)/i;
    
    // First check if we have a number at the beginning
    const numberMatch = trimmedName.match(numberPattern);
    
    if (!numberMatch) {
      // No number found, return the whole string as ingredient
      const sanitizedName = trimmedName;
      return {
        quantity: "",
        ingredient: sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1)
      };
    }
    
    // We have a number, extract it
    const numberPart = numberMatch[0];
    let remainingText = trimmedName.substring(numberPart.length).trim();
    
    // Check if the next word is a unit
    const nextWordMatch = remainingText.match(/^(\S+)/);
    
    if (nextWordMatch) {
      const nextWord = nextWordMatch[0].toLowerCase().replace(/[,.;:]$/, ''); // Remove trailing punctuation
      
      if (units.includes(nextWord)) {
        // This is a known unit, include it in the quantity
        const unitPart = nextWordMatch[0];
        const quantityWithUnit = `${numberPart} ${unitPart}`;
        
        // Everything after the unit is the ingredient
        const ingredientPart = remainingText.substring(unitPart.length).trim();
        
        if (ingredientPart) {
          return {
            quantity: quantityWithUnit,
            ingredient: ingredientPart.charAt(0).toUpperCase() + ingredientPart.slice(1)
          };
        }
      }
    }
    
    // If we reach here, we have a number but couldn't identify a unit
    // Let's just use the number as quantity and the rest as ingredient
    return {
      quantity: numberPart,
      ingredient: remainingText.charAt(0).toUpperCase() + remainingText.slice(1)
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
                    <div className="flex-1 flex">
                      {/* Quantity in its own element with distinct styling */}
                      {quantity && (
                        <div className="w-20 min-w-20 font-medium text-gray-700 mr-2 bg-gray-50 rounded px-2 py-1 flex items-center justify-center">
                          {quantity}
                        </div>
                      )}
                      
                      {/* Ingredient name in separate element */}
                      <div className="flex-1">
                        <p className="text-gray-800">{ingredient}</p>
                        {item.recipeName && (
                          <p className="text-xs text-gray-500">
                            From: <Link href={`/recipe/${item.recipeId}`} className="text-[#9cb99c] hover:underline">
                              {item.recipeName}
                            </Link>
                          </p>
                        )}
                      </div>
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