"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-screen bg-[#faf7f2] border-r border-[#e8e3d9] transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e8e3d9]">
        {!isCollapsed && <h2 className="font-semibold text-gray-700">Menu</h2>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1 rounded-md hover:bg-[#e8e3d9] transition-colors"
        >
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-2">
        {/* Recipes Section */}
        <div className="mb-6">
          {!isCollapsed && <h3 className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Recipes</h3>}
          {/* <Link href="/recipes">
            <div className={`flex items-center px-3 py-2 rounded-md hover:bg-[#e8e3d9] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <svg className="w-5 h-5 text-[#9cb99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {!isCollapsed && <span className="text-gray-700">All Recipes</span>}
            </div>
          </Link> */}
          <Link href="/favorites">
            <div className={`flex items-center px-3 py-2 rounded-md hover:bg-[#e8e3d9] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <svg className="w-5 h-5 text-[#9cb99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {!isCollapsed && <span className="text-gray-700">Favorites</span>}
            </div>
          </Link>
          {/* <Link href="/recipes/create">
            <div className={`flex items-center px-3 py-2 rounded-md hover:bg-[#e8e3d9] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <svg className="w-5 h-5 text-[#9cb99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {!isCollapsed && <span className="text-gray-700">Create Recipe</span>}
            </div>
          </Link> */}
        </div>

        {/* Shopping List Section */}
        <div>
          {!isCollapsed && <h3 className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Shopping</h3>}
          <Link href="/shopping-list">
            <div className={`flex items-center px-3 py-2 rounded-md hover:bg-[#e8e3d9] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <svg className="w-5 h-5 text-[#9cb99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {!isCollapsed && <span className="text-gray-700">Shopping List</span>}
            </div>
          </Link>
          <Link href="/pantry">
            <div className={`flex items-center px-3 py-2 rounded-md hover:bg-[#e8e3d9] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <svg className="w-5 h-5 text-[#9cb99c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!isCollapsed && <span className="text-gray-700">Pantry</span>}
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}