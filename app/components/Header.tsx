import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Code2, User, LogOut, BookmarkIcon } from 'lucide-react';
import { useAuth } from '../lib/hooks';
import { AuthModal } from './AuthModal';

export function Header() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-blue-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Georgia Tech</h1>
                  <p className="text-yellow-300 text-sm font-medium">Office of Student Achievement</p>
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-yellow-400 mx-4"></div>
              <div className="flex items-center space-x-2">
                <Code2 className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white hidden sm:block">Technology Internship Portal</h2>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium">Find Your Next Opportunity</p>
                <p className="text-yellow-300 text-sm">Technology & Engineering Internships</p>
              </div>
              
              {/* User Authentication */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-blue-900 font-bold text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium">
                      {user.full_name || user.email}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        Signed in as <br />
                        <strong>{user.email}</strong>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <BookmarkIcon className="h-4 w-4 mr-2" />
                        Saved Internships
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}