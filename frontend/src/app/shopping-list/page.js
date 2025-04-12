"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Mercator from "../../../public/mercator.png";
import Spar from "../../../public/spar.png";
import Image from "next/image";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [productData, setProductData] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({}); // Track open/closed state of dropdowns
  const [selectedProducts, setSelectedProducts] = useState({}); // Track selected products
  const [fetchStatus, setFetchStatus] = useState('idle'); // Track overall fetch status
  
  useEffect(() => {
    // Load shopping list from localStorage
    const storedItems = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    setItems(storedItems);

    // Auto-load products if we have items
    if (storedItems.length > 0) {
      batchFetchProducts(storedItems);
    }
  }, []);
  
  // Batch process ingredients to avoid rate limiting
  const batchFetchProducts = async (itemsList) => {
    setFetchStatus('loading');
    
    // Extract unique ingredients to avoid duplicate requests
    const uniqueIngredients = [...new Set(itemsList.map(item => {
      const { ingredient } = parseItemName(item.name);
      return ingredient;
    }))];
    
    console.log(`Starting batch fetch for ${uniqueIngredients.length} unique ingredients`);
    
    // Process in small batches with delay between batches
    const batchSize = 3;
    const delayBetweenBatches = 1500; // 1.5 seconds between batches
    
    for (let i = 0; i < uniqueIngredients.length; i += batchSize) {
      const batch = uniqueIngredients.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.join(', ')}`);
      
      // Show loading state for current batch
      batch.forEach(ingredient => {
        setLoadingProducts(prev => ({ ...prev, [ingredient]: true }));
      });
      
      // Process each ingredient in the current batch in parallel
      await Promise.all(batch.map(async (ingredient) => {
        try {
          // Skip if we already have data for this ingredient
          if (productData[ingredient]) return;
          
          const products = await fetchProductsForIngredient(ingredient);
          
          // Update product data
          setProductData(prev => ({ ...prev, [ingredient]: products }));
          
          // Set the cheapest product as selected
          if (products && products.length > 0) {
            setSelectedProducts(prev => ({ ...prev, [ingredient]: products[0] }));
          }
        } catch (error) {
          console.error(`Error processing ${ingredient}:`, error);
        } finally {
          setLoadingProducts(prev => ({ ...prev, [ingredient]: false }));
        }
      }));
      
      // If there are more batches to process, add delay
      if (i + batchSize < uniqueIngredients.length) {
        console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    setFetchStatus('complete');
    console.log('All batches processed');
  };
  
  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    localStorage.setItem('shoppingList', JSON.stringify(newItems));
  };
  
  const clearList = () => {
    setItems([]);
    setProductData({});
    setSelectedProducts({});
    localStorage.setItem('shoppingList', '[]');
  };

  // Select a different product for an ingredient
  const selectProduct = (ingredient, product) => {
    setSelectedProducts(prev => ({ ...prev, [ingredient]: product }));
    // Close the dropdown after selection
    setOpenDropdowns(prev => ({ ...prev, [ingredient]: false }));
  };

  // Toggle dropdown state for an ingredient
  const toggleDropdown = async (ingredient) => {
    // If we don't have products yet for this ingredient, fetch them
    if (!productData[ingredient] || productData[ingredient].length === 0) {
      setLoadingProducts(prev => ({ ...prev, [ingredient]: true }));
      const products = await fetchProductsForIngredient(ingredient);
      setProductData(prev => ({ ...prev, [ingredient]: products }));
      
      // Set the cheapest product as selected if not already set
      if (products.length > 0 && !selectedProducts[ingredient]) {
        setSelectedProducts(prev => ({ ...prev, [ingredient]: products[0] }));
      }
      
      setLoadingProducts(prev => ({ ...prev, [ingredient]: false }));
    }
    
    // Toggle dropdown state
    setOpenDropdowns(prev => ({ 
      ...prev, 
      [ingredient]: !prev[ingredient] 
    }));
  };

  // Helper function to parse price strings into numbers for sorting
  const parsePriceValue = (priceStr) => {
    if (!priceStr || typeof priceStr !== 'string') return Infinity;
    // Remove currency symbol and any non-numeric chars except decimal point
    const numericStr = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    const value = parseFloat(numericStr);
    return isNaN(value) ? Infinity : value;
  };

  const fetchProductsForIngredient = async (ingredient) => {
    try {
      const geminiResponse = await fetch('/api/auth/gemini', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ input: ingredient }),
       });
       
       if (!geminiResponse.ok) {
         throw new Error(`Failed to process with Gemini: ${geminiResponse.status}`);
       }
       
       const geminiData = await geminiResponse.json();
       const simplifiedQuery = geminiData.result || ingredient;

      // Sanitize the simplified query to remove quotes and keep only the first word if needed
      const cleanedQuery = simplifiedQuery
        .replace(/['"]/g, '') // Remove quotes
        .trim();    

      console.log(`Fetching products for ${ingredient} using query: ${cleanedQuery}`);
    
      // Fetch from both Mercator and SPAR APIs
      const [mercatorResponse, sparResponse] = await Promise.all([
        fetch(`/api/products-mercator?query=${encodeURIComponent(cleanedQuery)}`),
        fetch(`/api/products-spar?query=${encodeURIComponent(cleanedQuery)}`)
      ]);
      
      // Process Mercator data
      let mercatorProducts = [];
      if (mercatorResponse.ok) {
        const mercatorData = await mercatorResponse.json();
        if (mercatorData && Array.isArray(mercatorData)) {
          mercatorProducts = mercatorData;
        } else if (mercatorData && mercatorData.products && Array.isArray(mercatorData.products)) {
          mercatorProducts = mercatorData.products;
        } else if (mercatorData) {
          mercatorProducts = [mercatorData];
        }
        
        // Simplify Mercator products
        mercatorProducts = mercatorProducts.map(product => {
          // Parse price string to float
          const priceString = product.data?.current_price || 'N/A';
          const priceValue = priceString !== 'N/A' ? parsePriceValue(priceString) : Infinity;
          
          return {
            title: product.data?.name || 'Unknown Product',
            price: priceValue, // Store as float
            displayPrice: priceString, // Keep original for display
            image: product.mainImageSrc || '',
            store: 'Mercator'
          };
        });
      }
      
      // Process SPAR data
      let sparProducts = [];
      if (sparResponse.ok) {
        const sparData = await sparResponse.json();
        // SPAR API returns data in a different format - handle it appropriately
        if (sparData && sparData.hits && Array.isArray(sparData.hits)) {
          sparProducts = sparData.hits.map(hit => {
            // Ensure price is a float
            const priceValue = typeof hit.masterValues?.price === 'number' 
              ? hit.masterValues.price 
              : parsePriceValue(hit.masterValues?.price || 'N/A');
            
            return {
              title: hit.masterValues?.title || 'Unknown Product',
              price: priceValue, // Store as float
              displayPrice: hit.masterValues?.price || 'N/A', // Keep original for display
              image: hit.masterValues?.['image-url'] || '',
              store: 'SPAR'
            };
          });
        }
      }
      
      // Combine all products
      const allProducts = [...mercatorProducts, ...sparProducts];
      
      // Sort products by price from cheapest to most expensive
      const sortedProducts = allProducts.sort((a, b) => a.price - b.price);
      
      return sortedProducts;
    } catch (error) {
      console.error(`Error fetching products for ${ingredient}:`, error);
      return [];
    }
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
          <div className="mb-4 flex items-center justify-between">
            <button 
              onClick={clearList}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
            >
              Clear List
            </button>
            
            {fetchStatus === 'loading' && (
              <span className="text-sm text-blue-600">
                Loading product data...
              </span>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-[#e8e3d9]">
              {items.map((item, index) => {
                // Use the separate quantity and ingredient if they exist, otherwise parse from name
                const { quantity, ingredient } = item.quantity && item.ingredient 
                  ? { quantity: item.quantity, ingredient: item.ingredient } 
                  : parseItemName(item.name);
                
                // Get the selected product for this ingredient
                const selectedProduct = selectedProducts[ingredient];
                // Check if dropdown is open
                const isDropdownOpen = openDropdowns[ingredient];
                // Get products for this ingredient
                const products = productData[ingredient] || [];
                
                return (
                  <li key={index} className="p-4 flex flex-col">
                    <div className="flex items-center justify-between">
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
                      
                      <div className="flex items-center">
                        <button 
                          onClick={() => removeItem(index)}
                          className="text-gray-500 hover:text-red-500 ml-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Product selection dropdown */}
                    <div className="mt-2 relative">
                      <div 
                        className="flex items-center bg-green-50 p-2 rounded-md cursor-pointer border hover:border-blue-300"
                        onClick={() => toggleDropdown(ingredient)}
                      >
                        {selectedProduct ? (
                          <>
                            {selectedProduct.image && (
                              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-10 h-10 object-cover mr-2" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{selectedProduct.title}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="font-bold text-green-700 mr-3">{selectedProduct.displayPrice} €</span>
                              <div className="w-6 h-6 flex items-center justify-center">
                                <Image
                                  src={selectedProduct.store === 'SPAR' ? Spar : Mercator}
                                  alt={selectedProduct.store}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                              <svg 
                                className={`w-4 h-4 ml-3 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </>
                        ) : loadingProducts[ingredient] ? (
                          <div className="flex-1 text-sm text-gray-500 italic">
                            Finding best prices...
                          </div>
                        ) : (
                          <div className="flex-1 text-sm text-gray-500">
                            Click to select a product
                          </div>
                        )}
                      </div>
                      
                      {/* Dropdown content */}
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                          {loadingProducts[ingredient] ? (
                            <div className="p-3 text-sm text-gray-500">Loading products...</div>
                          ) : products.length > 0 ? (
                            <ul className="py-1">
                              {products.map((product, i) => (
                                <li 
                                  key={i} 
                                  className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${selectedProduct === product ? 'bg-green-50' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectProduct(ingredient, product);
                                  }}
                                >
                                  {product.image && (
                                    <img src={product.image} alt={product.title || 'Product'} className="w-10 h-10 object-cover mr-2" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{product.title || 'Unknown product'}</p>
                                    {product.displayPrice && <p className="text-sm">{product.displayPrice} €</p>}
                                  </div>
                                  <Image
                                    src={product.store === 'SPAR' ? Spar : Mercator}
                                    alt={product.store}
                                    width={24}
                                    height={24}
                                    className="object-contain ml-2"
                                  />
                                  
                                  {selectedProduct === product && (
                                    <span className="ml-2 text-green-600">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-3 text-sm text-gray-500">No products found for this ingredient.</div>
                          )}
                        </div>
                      )}
                    </div>
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