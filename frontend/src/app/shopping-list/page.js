"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Mercator from "../../../public/mercator.png";
import Spar from "../../../public/spar.png";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const INITIAL_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 3;
const BATCH_SIZE = 2; // Reduced from 3 to 2

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [productData, setProductData] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedProducts, setSelectedProducts] = useState({});
  const [fetchStatus, setFetchStatus] = useState('idle');
  const [sortBy, setSortBy] = useState('name');
  const [storeFilter, setStoreFilter] = useState('all');
  
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?returnUrl=/shopping-list');
    }
  }, [loading, isAuthenticated, router]);
  
  // If still loading auth state or not authenticated, show loading state
  if (loading || !isAuthenticated) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9cb99c] border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-gray-600">Verifying your access...</p>
        </div>
      </div>
    );
  }
  
  useEffect(() => {
    // Load shopping list from localStorage
    const storedItems = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    setItems(storedItems);

    // Auto-load products if we have items
    if (storedItems.length > 0) {
      batchFetchProducts(storedItems);
    }
  }, []);
  
  useEffect(() => {
    if (items.length > 0) {
      // Clear existing product data
      setProductData({});
      setSelectedProducts({});
      // Fetch products again with new store filter
      batchFetchProducts(items);
    }
  }, [storeFilter]); // Add storeFilter as dependency
  
  const batchFetchProducts = async (itemsList) => {
    setFetchStatus('loading');
    
    const uniqueIngredients = [...new Set(itemsList.map(item => {
      const { ingredient } = parseItemName(item.name);
      return ingredient;
    }))];
    
    console.log(`Starting fetch for ${uniqueIngredients.length} ingredients`);
    
    try {
      // Create an array of promises for all ingredients
      const fetchPromises = uniqueIngredients.map(async (ingredient) => {
        setLoadingProducts(prev => ({ ...prev, [ingredient]: true }));
        
        try {
          if (!productData[ingredient]) {
            const products = await fetchProductsForIngredient(ingredient);
            
            setProductData(prev => ({ ...prev, [ingredient]: products }));
            
            if (products && products.length > 0) {
              setSelectedProducts(prev => ({ ...prev, [ingredient]: products[0] }));
            }
          }
        } catch (error) {
          console.error(`Failed to fetch products for ${ingredient}:`, error);
        } finally {
          setLoadingProducts(prev => ({ ...prev, [ingredient]: false }));
        }
      });

      // Wait for all fetches to complete
      await Promise.all(fetchPromises);
      
    } catch (error) {
      console.error('Error during parallel fetching:', error);
    }
    
    setFetchStatus('complete');
    console.log('All ingredients processed');
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

  const clearStoreItems = (storeName) => {
    if (window.confirm(`Are you sure you want to clear all ${storeName} items?`)) {
      const newItems = items.filter(item => {
        const { ingredient } = parseItemName(item.name);
        const product = selectedProducts[ingredient];
        return product?.store !== storeName;
      });
      setItems(newItems);
      localStorage.setItem('shoppingList', JSON.stringify(newItems));
    }
  };

  const buyStoreItems = (storeName) => {
    if (window.confirm(`Are you sure you want to buy these ${storeName} items?`)) {
      // Get items from this store
      const storeItems = items.filter(item => {
        const { ingredient } = parseItemName(item.name);
        const product = selectedProducts[ingredient];
        return product?.store === storeName;
      });

      // Convert store items to pantry items with full product details
      const pantryItems = storeItems.map(item => {
        const { quantity, ingredient } = parseItemName(item.name);
        const selectedProduct = selectedProducts[ingredient];
        
        return {
          name: selectedProduct?.title || ingredient,
          originalIngredient: ingredient,
          quantity: quantity,
          purchaseDate: new Date().toISOString(),
          price: selectedProduct?.price || 0,
          displayPrice: selectedProduct?.displayPrice || 'N/A',
          image: selectedProduct?.image || '',
          store: selectedProduct?.store || storeName,
          // Preserve recipe info if it exists
          recipeName: item.recipeName,
          recipeId: item.recipeId
        };
      });

      // Get existing pantry items
      const existingPantryItems = JSON.parse(localStorage.getItem('pantryItems') || '[]');
      
      // Combine existing and new pantry items
      const updatedPantryItems = [...existingPantryItems, ...pantryItems];
      
      // Save to pantry in localStorage
      localStorage.setItem('pantryItems', JSON.stringify(updatedPantryItems));
      
      // Remove bought items from shopping list
      const remainingItems = items.filter(item => {
        const { ingredient } = parseItemName(item.name);
        const product = selectedProducts[ingredient];
        return product?.store !== storeName;
      });
      
      setItems(remainingItems);
      localStorage.setItem('shoppingList', JSON.stringify(remainingItems));
      
      alert(`${storeName} items have been moved to your pantry!`);
    }
  };

  const buyItems = () => {
    if (window.confirm('Are you sure you want to buy these items?')) {
      const pantryItems = items.map(item => {
        const { quantity, ingredient } = item.quantity && item.ingredient 
          ? { quantity: item.quantity, ingredient: item.ingredient } 
          : parseItemName(item.name);
        
        const selectedProduct = selectedProducts[ingredient];
        
        return {
          name: selectedProduct?.title || ingredient,
          originalIngredient: ingredient,
          quantity: quantity,
          purchaseDate: new Date().toISOString(),
          price: selectedProduct?.price || 0,
          displayPrice: selectedProduct?.displayPrice || 'N/A',
          image: selectedProduct?.image || '',
          store: selectedProduct?.store || '',
          // Preserve recipe info if it exists
          recipeName: item.recipeName,
          recipeId: item.recipeId
        };
      });
      
      const existingPantryItems = JSON.parse(localStorage.getItem('pantryItems') || '[]');
      const updatedPantryItems = [...existingPantryItems, ...pantryItems];
      localStorage.setItem('pantryItems', JSON.stringify(updatedPantryItems));
      
      clearList();
      
      alert('Items have been moved to your pantry!');
      window.location.href = '/pantry';
    }
  };

  const selectProduct = (ingredient, product) => {
    setSelectedProducts(prev => ({ ...prev, [ingredient]: product }));
    setOpenDropdowns(prev => ({ ...prev, [ingredient]: false }));
  };

  const toggleDropdown = async (ingredient) => {
    if (!productData[ingredient] || productData[ingredient].length === 0) {
      setLoadingProducts(prev => ({ ...prev, [ingredient]: true }));
      const products = await fetchProductsForIngredient(ingredient);
      setProductData(prev => ({ ...prev, [ingredient]: products }));
      
      const filteredProducts = storeFilter === 'all' 
        ? products 
        : products.filter(p => p.store === storeFilter);
      
      if (filteredProducts.length > 0 && !selectedProducts[ingredient]) {
        setSelectedProducts(prev => ({ ...prev, [ingredient]: filteredProducts[0] }));
      }
      
      setLoadingProducts(prev => ({ ...prev, [ingredient]: false }));
    } else {
      const currentSelection = selectedProducts[ingredient];
      const availableProducts = productData[ingredient].filter(p => 
        storeFilter === 'all' || p.store === storeFilter
      );
      
      if (currentSelection && storeFilter !== 'all' && currentSelection.store !== storeFilter) {
        if (availableProducts.length > 0) {
          setSelectedProducts(prev => ({ ...prev, [ingredient]: availableProducts[0] }));
        }
      }
    }
    
    setOpenDropdowns(prev => ({ 
      ...prev, 
      [ingredient]: !prev[ingredient] 
    }));
  };

  const parsePriceValue = (priceStr) => {
    console.log(priceStr)
    if (!priceStr || typeof priceStr !== 'string') return Infinity;
    const numericStr = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.');
    const value = parseFloat(numericStr);
    return isNaN(value) ? Infinity : value;
  };

  const fetchProductsForIngredient = async (ingredient) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

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

      const cleanedQuery = simplifiedQuery
        .replace(/['"]/g, '')
        .trim();    

      console.log(`Fetching products for ${ingredient} using query: ${cleanedQuery}`);
    
      let products = [];
      
      if (storeFilter === 'Mercator' || storeFilter === 'all') {
        const mercatorResponse = await fetch(`/api/products-mercator?query=${encodeURIComponent(cleanedQuery)}`);
        if (mercatorResponse.ok) {
          const mercatorData = await mercatorResponse.json();
          let mercatorProducts = [];
          
          if (Array.isArray(mercatorData)) {
            mercatorProducts = mercatorData;
          } else if (mercatorData?.products && Array.isArray(mercatorData.products)) {
            mercatorProducts = mercatorData.products;
          } else if (mercatorData) {
            mercatorProducts = [mercatorData];
          }
          
          mercatorProducts = mercatorProducts.map(product => ({
            title: product.data?.name || 'Unknown Product',
            price: parsePriceValue(product.data?.current_price || 'N/A'),
            displayPrice: product.data?.current_price || 'N/A',
            image: product.mainImageSrc || '',
            store: 'Mercator'
          }));
          
          products = [...products, ...mercatorProducts];
        }
      }
      
      if (storeFilter === 'SPAR' || storeFilter === 'all') {
        const sparResponse = await fetch(`/api/products-spar?query=${encodeURIComponent(cleanedQuery)}`);
        if (sparResponse.ok) {
          const sparData = await sparResponse.json();
          if (sparData?.hits && Array.isArray(sparData.hits)) {
            const sparProducts = sparData.hits.map(hit => 
              (
              {
              title: hit.masterValues?.title || 'Unknown Product',
              price: parsePriceValue(hit.masterValues?.price || 'N/A'),
              displayPrice: hit.masterValues?.price || 'N/A',
              image: hit.masterValues?.['image-url'] || '',
              store: 'SPAR'
            }));
            products = [...products, ...sparProducts];
          }
        }
      }
      
      if (products.length > 0) {
        const filterPrompt = {
          ingredient: ingredient,
          products: products.map(p => ({
            title: p.title,
            store: p.store,
            price: p.displayPrice
          }))
        };

        const geminiFilterResponse = await fetch('/api/auth/gemini-filter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filterPrompt),
        });

        if (!geminiFilterResponse.ok) {
          throw new Error(`Failed to filter with Gemini: ${geminiFilterResponse.status}`);
        }

        const geminiFilterData = await geminiFilterResponse.json();
        
        if (Array.isArray(geminiFilterData.relevantIndices)) {
          products = products.filter((_, index) => 
            geminiFilterData.relevantIndices.includes(index)
          );
        }
      }

      return products.sort((a, b) => {
  const priceA = a.store === 'SPAR' ? (a.displayPrice) : a.price;
  const priceB = b.store === 'SPAR' ? (b.displayPrice) : b.price;
  return priceA - priceB;
});
      
    } catch (error) {
      console.error(`Error fetching/filtering products for ${ingredient}:`, error);
      return [];
    }
  };

  const parseItemName = (name) => {
    if (!name) return { quantity: "", ingredient: "" };
    
    const trimmedName = name.trim();
    
    const units = [
      'cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 
      'teaspoon', 'teaspoons', 'tsp', 'oz', 'ounce', 'ounces',
      'pound', 'pounds', 'lb', 'lbs', 'gram', 'grams', 'g',
      'kg', 'kilogram', 'kilograms', 'ml', 'milliliter', 'milliliters',
      'l', 'liter', 'liters', 'pinch', 'pinches', 'dash', 'dashes',
      'handful', 'handfuls', 'slice', 'slices', 'piece', 'pieces',
      'can', 'cans', 'bottle', 'bottles', 'clove', 'cloves'
    ];
    
    const numberPattern = /^([\d.,½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\/[\d.,]+)?(?:\s*-\s*[\d.,½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?)/i;
    
    const numberMatch = trimmedName.match(numberPattern);
    
    if (!numberMatch) {
      const sanitizedName = trimmedName;
      return {
        quantity: "",
        ingredient: sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1)
      };
    }
    
    const numberPart = numberMatch[0];
    let remainingText = trimmedName.substring(numberPart.length).trim();
    
    const nextWordMatch = remainingText.match(/^(\S+)/);
    
    if (nextWordMatch) {
      const nextWord = nextWordMatch[0].toLowerCase().replace(/[,.;:]$/, '');
      
      if (units.includes(nextWord)) {
        const unitPart = nextWordMatch[0];
        const quantityWithUnit = `${numberPart} ${unitPart}`;
        
        const ingredientPart = remainingText.substring(unitPart.length).trim();
        
        if (ingredientPart) {
          return {
            quantity: quantityWithUnit,
            ingredient: ingredientPart.charAt(0).toUpperCase() + ingredientPart.slice(1)
          };
        }
      }
    }
    
    return {
      quantity: numberPart,
      ingredient: remainingText.charAt(0).toUpperCase() + remainingText.slice(1)
    };
  };

  const calculateStoreTotal = (storeName) => {
    return items.reduce((total, item) => {
      const { ingredient } = parseItemName(item.name);
      const selectedProduct = selectedProducts[ingredient];
      if (selectedProduct?.store === storeName) {
        if (storeName === 'SPAR') {
          return total + selectedProduct.displayPrice;
        } else if (storeName === 'Mercator') {
          return total + (selectedProduct.price || 0);
        }
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const { ingredient } = parseItemName(item.name);
      const selectedProduct = selectedProducts[ingredient];
      if (selectedProduct) {
        if (selectedProduct.store === 'SPAR') {
          return total + selectedProduct.displayPrice;
        } else if (selectedProduct.store === 'Mercator') {
          return total + (selectedProduct.price || 0);
        }
      }
      return total;
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping List</h1>
      
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              {/* <option value="store">Store</option> */}
            </select>
          </div>
          
          {/* <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Store:</label>
            <select 
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All Stores</option>
              <option value="Mercator">Mercator</option>
              <option value="SPAR">SPAR</option>
            </select>
          </div> */}
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center my-8 text-gray-500">
          Your shopping list is empty
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src={Mercator}
                      alt="Mercator"
                      width={24}
                      height={24}
                      className="object-contain mr-2"
                    />
                    <h3 className="font-medium">Mercator Items</h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {items
                        .filter(item => {
                          const { ingredient } = parseItemName(item.name);
                          const product = selectedProducts[ingredient];
                          return product?.store === 'Mercator';
                        }).length} items
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => clearStoreItems('Mercator')}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => buyStoreItems('Mercator')}
                      className="bg-[#9cb99c] hover:bg-[#8aa98a] text-white py-1 px-2 rounded-md text-sm"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-[#e8e3d9]">
                {renderStoreItems('Mercator')}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src={Spar}
                      alt="SPAR"
                      width={24}
                      height={24}
                      className="object-contain mr-2"
                    />
                    <h3 className="font-medium">SPAR Items</h3>
                    <span className="ml-2 text-sm text-gray-500">
                      {items
                        .filter(item => {
                          const { ingredient } = parseItemName(item.name);
                          const product = selectedProducts[ingredient];
                          return product?.store === 'SPAR';
                        }).length} items
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => clearStoreItems('SPAR')}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => buyStoreItems('SPAR')}
                      className="bg-[#9cb99c] hover:bg-[#8aa98a] text-white py-1 px-2 rounded-md text-sm"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-[#e8e3d9]">
                {renderStoreItems('SPAR')}
              </ul>
            </div>
            
            {storeFilter === 'all' && items.filter(item => {
              const { ingredient } = parseItemName(item.name);
              const product = selectedProducts[ingredient];
              return !product?.store;
            }).length > 0 && (
              <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden mt-4">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h3 className="font-medium">Items Without Assigned Store</h3>
                  <span className="text-sm text-gray-500">
                    {items
                      .filter(item => {
                        const { ingredient } = parseItemName(item.name);
                        const product = selectedProducts[ingredient];
                        return !product?.store;
                      }).length} items
                  </span>
                </div>
                <ul className="divide-y divide-[#e8e3d9]">
                  {renderStoreItems('unassigned')}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Image
                      src={Mercator}
                      alt="Mercator"
                      width={24}
                      height={24}
                      className="object-contain mr-2"
                    />
                    <span className="font-medium">Mercator Total:</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {calculateStoreTotal('Mercator').toFixed(2)} €
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Image
                      src={Spar}
                      alt="SPAR"
                      width={24}
                      height={24}
                      className="object-contain mr-2"
                    />
                    <span className="font-medium">SPAR Total:</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {calculateStoreTotal('SPAR').toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total for all stores:</span>
                <span className="text-xl font-bold text-green-700">
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

function renderStoreItems(store) {
  const filteredItems = items
    .slice()
    .sort((a, b) => {
      const { ingredient: ingA } = parseItemName(a.name);
      const { ingredient: ingB } = parseItemName(b.name);
      const prodA = selectedProducts[ingA];
      const prodB = selectedProducts[ingB];
      
      switch(sortBy) {
        case 'price':
          const priceA = prodA?.store === 'SPAR' ? (prodA.displayPrice) : (prodA?.price || 0);
          const priceB = prodB?.store === 'SPAR' ? (prodB.displayPrice) : (prodB?.price || 0);
          return priceA - priceB;
        case 'store':
          return (prodA?.store || '').localeCompare(prodB?.store || '');
        case 'name':
        default:
          return ingA.localeCompare(ingB);
      }
    })
      .filter(item => {
        const { ingredient } = parseItemName(item.name);
        const product = selectedProducts[ingredient];
        
        if (store === 'unassigned') {
          return !product?.store;
        }
        
        return product?.store === store;
      });

    if (filteredItems.length === 0) {
      return (
        <li className="p-4 text-center text-gray-500 italic">
          No items in this store
        </li>
      );
    }

    return filteredItems.map((item, index) => {
      const { quantity, ingredient } = item.quantity && item.ingredient 
        ? { quantity: item.quantity, ingredient: item.ingredient } 
        : parseItemName(item.name);
      
      const selectedProduct = selectedProducts[ingredient];
      const isDropdownOpen = openDropdowns[ingredient];
      const products = productData[ingredient] || [];
      const filteredProducts = storeFilter === 'all' 
        ? products 
        : products.filter(p => p.store === storeFilter);
      
      return (
        <li key={index} className="p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex">
              {quantity && (
                <div className="w-20 min-w-20 font-medium text-gray-700 mr-2 bg-gray-50 rounded px-2 py-1 flex items-center justify-center">
                  {quantity}
                </div>
              )}
              
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
          
          <div className="mt-2 relative">
            <div 
              className="flex items-center justify-between bg-green-50 p-2 rounded-md cursor-pointer border hover:border-blue-300"
              onClick={() => toggleDropdown(ingredient)}
            >
              {loadingProducts[ingredient] ? (
                <div className="flex items-center justify-center w-full py-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#9cb99c] border-r-transparent"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading products...</span>
                </div>
              ) : selectedProduct ? (
                <>
                  <div className="flex items-center">
                    {selectedProduct.image && (
                      <div className="w-10 h-10 mr-2 flex-shrink-0">
                        <Image 
                          src={selectedProduct.image} 
                          alt={selectedProduct.title}
                          width={40} 
                          height={40}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{selectedProduct.title}</p>
                      <p className="text-sm text-gray-600">{selectedProduct.store}</p>
                    </div>
                  </div>
                  <div className="ml-2 text-sm font-medium">{selectedProduct.displayPrice} €</div>
                </>
              ) : (
                <div className="text-sm text-gray-500 w-full text-center">No product selected</div>
              )}
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No products available
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredProducts.map((product, idx) => (
                      <li 
                        key={idx}
                        onClick={() => selectProduct(ingredient, product)}
                        className={`p-2 hover:bg-gray-50 cursor-pointer ${
                          selectedProduct?.title === product.title ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {product.image && (
                              <div className="w-10 h-10 mr-2 flex-shrink-0">
                                <Image 
                                  src={product.image}
                                  alt={product.title}
                                  width={40}
                                  height={40}
                                  className="object-contain w-full h-full"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder.png";
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">{product.title}</p>
                              <p className="text-xs text-gray-500">{product.store}</p>
                            </div>
                          </div>
                          <div className="ml-2 text-sm font-medium">{product.displayPrice} €</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </li>
      );
    });
  }
}