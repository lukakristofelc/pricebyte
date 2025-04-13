"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./auth/login/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Client component for the authenticated layout
function AuthenticatedLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  console.log("AuthenticatedLayout: ", { isAuthenticated, loading });

  // If loading auth state, show a simple loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9cb99c]"></div>
      </div>
    );
  }

  // If authenticated, show with navbar and sidebar
  if (isAuthenticated) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page instead of the requested content
  return (
    <div className="h-screen">
      <Login />
    </div>
  );
}

// Root layout with AuthProvider
export default function RootLayout({ children }) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
