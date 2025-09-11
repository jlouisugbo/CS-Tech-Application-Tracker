import React from 'react';

export function InternshipCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Company name skeleton */}
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          
          {/* Role title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
          
          {/* Details row */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        {/* Action button skeleton */}
        <div className="h-9 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

export function InternshipGridSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
      {/* Company name skeleton */}
      <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
      
      {/* Role title skeleton */}
      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
      
      {/* Category badge skeleton */}
      <div className="h-6 bg-gray-200 rounded-full w-20 mb-3"></div>
      
      {/* Location skeleton */}
      <div className="h-3 bg-gray-200 rounded w-16 mb-4"></div>
      
      {/* Action button skeleton */}
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
      
      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        ))}
      </div>
      
      {/* Results counter skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      
      {/* Internship cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <InternshipCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function FilterLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

export function StatusLoadingSkeleton() {
  return (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  );
}