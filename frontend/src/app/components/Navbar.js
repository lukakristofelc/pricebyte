"use client";


import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/Logo.png"; 
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-[#faf7f2] border-b border-[#e8e3d9]">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center">
            <div className="w-fit h-fit p-2 rounded-md flex items-center justify-center ">
              <Image 
                src={Logo} 
                alt="PriceByte Logo" 
                width={140} 
                height={20}
                className="text-white"
              />
            </div>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full py-2 pl-10 pr-3 text-sm text-gray-700 border border-[#e8e3d9] rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#9cb99c]"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Notification and User Icons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <button className="p-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button className="w-8 h-8 rounded-full bg-[#9cb99c] flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                )}
              </button>
              
              {/* Dropdown Menu - We'll add a simple dropdown for logout */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <div className="text-[#9cb99c] hover:text-[#7d9e7d] font-medium">
                Sign in
              </div>
            </Link>
            <Link href="/auth/register">
              <div className="bg-[#9cb99c] hover:bg-[#7d9e7d] text-white px-4 py-2 rounded-md font-medium">
                Sign up
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}