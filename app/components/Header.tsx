import React from 'react';
import Link from 'next/link';
import { GraduationCap, Code2, User, Search } from 'lucide-react';

export function Header() {

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
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-400 rounded-lg">
                <User className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-300 text-sm font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <Link
                href="/"
                className="border-yellow-400 text-yellow-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Browse Internships</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}