import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Code2, User, LogOut, BookmarkIcon, Home, Search } from 'lucide-react';
import { useAuth } from '../lib/hooks';
import { AuthModal } from './AuthModal';

export function Header() {
  const { user, loading, initializing, signOut } = useAuth();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
    } finally {
      setSigningOut(false);
      setShowUserMenu(false);
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-90 transition-opacity">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 sm:p-2 bg-yellow-500 rounded-lg">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-900" />
                </div>
                <div className="hidden xs:block">
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Georgia Tech</h1>
                  <p className="text-yellow-300 text-xs sm:text-sm font-medium hidden sm:block">Office of Student Achievement</p>
                </div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-yellow-400 mx-4"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                <h2 className="text-sm sm:text-xl font-semibold text-white">
                  <span className="sm:hidden">GT Internships</span>
                  <span className="hidden sm:block">Technology Internship Portal</span>
                </h2>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium">Find Your Next Opportunity</p>
                <p className="text-yellow-300 text-sm">Technology & Engineering Internships</p>
              </div>
              
              {/* User Authentication */}
              {initializing || loading ? (
                <div className="flex items-center space-x-2 px-4 py-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="hidden sm:block w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    disabled={signingOut}
                    className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors focus:outline-none disabled:opacity-50"
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
                        disabled={signingOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {signingOut ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing Out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </>
                        )}
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
        
        {/* Navigation Tabs */}
        <div className="border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <Link
                href="/"
                className={`${
                  pathname === '/' 
                    ? 'border-yellow-400 text-yellow-300' 
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-400'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                <Search className="h-4 w-4" />
                <span>Browse Internships</span>
              </Link>
              
              {user && (
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === '/dashboard' 
                      ? 'border-yellow-400 text-yellow-300' 
                      : 'border-transparent text-blue-200 hover:text-white hover:border-blue-400'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <BookmarkIcon className="h-4 w-4" />
                  <span>My Dashboard</span>
                </Link>
              )}
            </nav>
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