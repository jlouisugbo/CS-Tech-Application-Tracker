"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GraduationCap, Code2, User, Search, LogIn, UserCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../lib/hooks';
import { getGuestApplyPreference, setGuestApplyPreference } from '../lib/auth-utils';
import { useToast } from './toast/ToastProvider';
import { AuthModal } from './AuthModal';

export function Header() {
  const { user, loading, signOut, sessionError, clearSessionError } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState<undefined | 'apply'>(undefined);
  const [onContinueAsGuest, setOnContinueAsGuest] = useState<undefined | ((dontAskAgain: boolean) => void)>(undefined);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();
  const [guestPref, setGuestPref] = useState(false);

  useEffect(() => {
    setGuestPref(getGuestApplyPreference());
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Sign out error:', result.error.message);
        // Still close menu and clear signing out state
      }
      setShowUserMenu(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setSigningOut(false);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Listen for global requests to open auth modal with context (e.g., from Apply click)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      setAuthReason(ce.detail?.reason);
      setOnContinueAsGuest(() => ce.detail?.onContinueAsGuest);
      setShowAuthModal(true);
    };
    window.addEventListener('open-auth-modal', handler as EventListener);
    return () => window.removeEventListener('open-auth-modal', handler as EventListener);
  }, []);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
  <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3">
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

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium">Find Your Next Opportunity</p>
                <p className="text-yellow-300 text-sm">Technology & Engineering Internships</p>
              </div>

              {/* Session Error Alert */}
              {sessionError && (
                <div className="fixed top-16 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-5 w-5 text-red-400">⚠️</div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        Session Issue
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        {sessionError}
                      </div>
                    </div>
                    <button
                      onClick={clearSessionError}
                      className="ml-4 text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* User Authentication */}
              <div className="relative">
                {loading ? (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg min-h-[44px]">
                    <User className="h-4 w-4 text-yellow-300 animate-pulse" />
                    <span className="text-yellow-300 text-sm font-medium">Loading...</span>
                  </div>
                ) : user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-400 rounded-lg hover:bg-green-500/30 transition-colors min-h-[44px] touch-manipulation"
                      aria-expanded={showUserMenu}
                      aria-haspopup="true"
                    >
                      <UserCircle className="h-4 w-4 text-green-300" />
                      <span className="text-green-300 text-sm font-medium">{user.email?.split('@')[0]}</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.full_name || user.email?.split('@')[0]}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] touch-manipulation"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {signingOut ? 'Signing Out...' : 'Sign Out'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/20 border border-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors min-h-[44px] touch-manipulation"
                    >
                      <LogIn className="h-4 w-4 text-yellow-300" />
                      <span className="text-yellow-300 text-sm font-medium">Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        const next = !guestPref;
                        setGuestApplyPreference(next);
                        setGuestPref(next);
                        const message = next
                          ? 'Guest apply enabled: You will no longer be prompted to sign in when applying.'
                          : 'Guest apply disabled: We will prompt you to sign in so you can track your applications.';
                        show(message, 'info');
                      }}
                      className={`px-3 py-2 border rounded-lg min-h-[44px] text-xs font-medium transition-colors ${guestPref ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50' : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'}`}
                      title={guestPref ? 'Disable guest apply prompts' : 'Enable guest apply (no prompts)'}
                    >
                      {guestPref ? 'Guest: On' : 'Guest: Off'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
              <Link
                href="/"
                className="border-yellow-400 text-yellow-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Browse Internships</span>
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="border-transparent text-yellow-200 hover:text-yellow-300 hover:border-yellow-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>My Dashboard</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthReason(undefined);
          setOnContinueAsGuest(undefined);
        }}
        reason={authReason}
        onContinueAsGuest={onContinueAsGuest}
      />
    </>
  );
}