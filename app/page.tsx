'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Building2 } from 'lucide-react';
import { Header } from './components/Header';
import { CompactFilterBar } from './components/CompactFilterBar';
import { CompactInternshipCard } from './components/CompactInternshipCard';
import { CompanyGroupView } from './components/CompanyGroupView';
import { RefreshStatus } from './components/RefreshStatus';
import { Pagination } from './components/Pagination';
import { ExportButtons } from './components/ExportButtons';
import { Footer } from './components/Footer';
import { LoadingPage, InternshipCardSkeleton, InternshipGridSkeleton, SearchLoadingIndicator, FilteringSkeleton } from './components/LoadingSkeletons';
import { SearchWithAutocomplete } from './components/SearchWithAutocomplete';
import { useInternships, useAuth, useFilterOptions, useNetworkStatus } from './lib/hooks';
import type { FilterState } from './types';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 internships per page
  const [isFiltering, setIsFiltering] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    location: 'All',
    citizenship: 'All',
    sponsorship: 'All',
    freshman_friendly: false,
    company: 'All',
    date_posted: 'All',
    sort_by: 'date_newest',
    company_sort_by: 'most_positions',
    view_mode: 'list',
    group_expanded: {}
  });

  const { user, loading: authLoading } = useAuth();
  const { internships, loading, error, retry, retryCount } = useInternships(filters);
  const { companies, locations, datePosted } = useFilterOptions();
  const isOnline = useNetworkStatus();

  // Create search suggestions from company names, roles, and categories
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    
    internships.forEach(internship => {
      suggestions.add(internship.company);
      suggestions.add(internship.role);
      suggestions.add(internship.category);
    });
    
    return Array.from(suggestions).sort();
  }, [internships]);

  const { allFilteredInternships, paginatedInternships, totalPages } = useMemo(() => {
    // Show filtering state for a brief moment when search/filters change
    const shouldShowFiltering = isFiltering && !loading;

    // First apply search filter
    let filtered = internships;
    if (searchTerm) {
      filtered = internships.filter(internship =>
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInternships = filtered.slice(startIndex, endIndex);

    return {
      allFilteredInternships: filtered,
      paginatedInternships,
      totalPages
    };
  }, [internships, searchTerm, currentPage, itemsPerPage, isFiltering, loading]);

  const handleFilterChange = (filterType: keyof FilterState, value: string | boolean) => {
    setCurrentPage(1); // Reset to first page when filters change
    setIsFiltering(true);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));

    // Clear filtering state after a brief delay to show the filtering indicator
    setTimeout(() => setIsFiltering(false), 500);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page
    setIsFiltering(true);
    setFilters({
      category: 'All',
      location: 'All',
      citizenship: 'All',
      sponsorship: 'All',
      freshman_friendly: false,
      company: 'All',
      date_posted: 'All',
      sort_by: 'date_newest',
      company_sort_by: 'most_positions',
      view_mode: 'list',
      group_expanded: {}
    });

    // Clear filtering state after a brief delay
    setTimeout(() => setIsFiltering(false), 500);
  };

  // Reset page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setIsFiltering(true);

    // Clear filtering state after a brief delay
    setTimeout(() => setIsFiltering(false), 300);
  };

  // Handle company group expansion - memoized to prevent recreating on every render
  const handleToggleGroup = useCallback((company: string) => {
    setFilters(prev => ({
      ...prev,
      group_expanded: {
        ...prev.group_expanded,
        [company]: !prev.group_expanded[company]
      }
    }));
  }, []);

  const hasActiveFilters = searchTerm !== '' || 
    filters.category !== 'All' || 
    filters.location !== 'All' || 
    filters.citizenship !== 'All' || 
    filters.sponsorship !== 'All' || 
    filters.freshman_friendly || 
    filters.company !== 'All' || 
    filters.date_posted !== 'All' || 
    filters.sort_by !== 'date_newest' ||
    filters.company_sort_by !== 'most_positions';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search and Filters Section */}
  <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Enhanced Search Bar with Autocomplete */}
        <div className="mb-6">
          <SearchWithAutocomplete 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            suggestions={searchSuggestions}
            placeholder="Search by company, position, or category..."
          />
        </div>

        {/* Filter Bar */}
        <CompactFilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          dynamicOptions={{
            companies,
            locations,
            datePosted
          }}
        />

        {/* Offline Status Banner */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>You're offline.</strong> Some features may not work properly. Check your internet connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error State with Retry */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Unable to load internships
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {!isOnline && error.includes('fetch')
                      ? 'Unable to connect to the server. Please check your internet connection and try again.'
                      : error
                    }
                  </p>
                  {retryCount > 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      Retry attempt #{retryCount}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={retry}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Counter and Status */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <Building2 className="h-5 w-5 mr-2" />
            <span className="text-lg font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allFilteredInternships.length)} of {allFilteredInternships.length} internships
              {allFilteredInternships.length !== internships.length && (
                <span className="text-gray-500 ml-1">({internships.length} total)</span>
              )}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <RefreshStatus />
            <ExportButtons filters={filters} savedOnly={false} variant="compact" />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Top Pagination - Show for list/grid views */}
        {filters.view_mode !== 'grouped' && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={allFilteredInternships.length}
            onPageChange={setCurrentPage}
            className="mb-6"
          />
        )}

        {/* Enhanced Loading State */}
        {loading && <LoadingPage />}

        {/* Filtering Loading Indicator */}
        {!loading && isFiltering && <SearchLoadingIndicator />}

        {/* Internships Display */}
        {!loading && !isFiltering && (
          <>
            {allFilteredInternships.length > 0 ? (
              <>
                {/* List View */}
                {filters.view_mode === 'list' && (
                  <div className="space-y-3">
                    {paginatedInternships.map((internship, index) => (
                      <CompactInternshipCard 
                        key={internship.id} 
                        internship={internship} 
                        variant="list"
                        isEven={index % 2 === 0}
                      />
                    ))}
                  </div>
                )}

                {/* Grid View */}
                {filters.view_mode === 'grid' && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {paginatedInternships.map((internship, index) => (
                      <CompactInternshipCard 
                        key={internship.id} 
                        internship={internship} 
                        variant="grid"
                        isEven={index % 2 === 0}
                      />
                    ))}
                  </div>
                )}

                {/* Company Grouped View */}
                {filters.view_mode === 'grouped' && (
                  <CompanyGroupView
                    internships={allFilteredInternships}
                    groupExpanded={filters.group_expanded}
                    onToggleGroup={handleToggleGroup}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    companySortBy={filters.company_sort_by}
                    onCompanySortChange={(sort) => handleFilterChange('company_sort_by', sort)}
                  />
                )}

                {/* Bottom Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={allFilteredInternships.length}
                  onPageChange={setCurrentPage}
                  className="mt-8"
                />
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                  {internships.length === 0 && !searchTerm && !hasActiveFilters ? (
                    // Empty database state
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-.974-5.709-2.292m11.418 0A7.962 7.962 0 0112 15c2.34 0 4.291-.974 5.709-2.292M15 11V9a3 3 0 00-3-3H9.172a4 4 0 01-2.828-1.172M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    // No results for filters/search
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>

                {internships.length === 0 && !searchTerm && !hasActiveFilters ? (
                  // Empty database state
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Internships Available</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      The internships database appears to be empty. This usually means the data hasn't been scraped yet.
                    </p>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 mb-4">
                        To populate the database, you can:
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 max-w-lg mx-auto">
                        <p className="text-sm text-gray-700 mb-2 font-medium">Run the scraper:</p>
                        <code className="bg-gray-800 text-green-400 px-3 py-2 rounded text-sm block">
                          python scraper/main.py
                        </code>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        This will fetch the latest internship opportunities from various sources.
                      </p>
                    </div>
                  </>
                ) : (
                  // No results for current search/filters
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Matching Internships</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm ? (
                        <>No internships found matching "<strong>{searchTerm}</strong>"{hasActiveFilters ? " with your current filters" : ""}.</>
                      ) : (
                        <>No internships match your current filter criteria.</>
                      )}
                    </p>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 mb-4">Try adjusting your search:</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            Clear Search
                          </button>
                        )}
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>

                      {searchTerm && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto">
                          <p className="text-sm text-blue-800 mb-2 font-medium">Search Tips:</p>
                          <ul className="text-xs text-blue-700 space-y-1 text-left">
                            <li>• Try broader terms (e.g., "software" instead of "software engineer")</li>
                            <li>• Check your spelling</li>
                            <li>• Try company names or job categories</li>
                            <li>• Remove some filters to expand results</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}