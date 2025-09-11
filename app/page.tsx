'use client'

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Building2 } from 'lucide-react';
import { Header } from './components/Header';
import { CompactFilterBar } from './components/CompactFilterBar';
import { CompactInternshipCard } from './components/CompactInternshipCard';
import { CompanyGroupView } from './components/CompanyGroupView';
import { RefreshStatus } from './components/RefreshStatus';
import { Pagination } from './components/Pagination';
import { Footer } from './components/Footer';
import { LoadingPage, InternshipCardSkeleton, InternshipGridSkeleton } from './components/LoadingSkeletons';
import { SearchWithAutocomplete } from './components/SearchWithAutocomplete';
import { useInternships, useAuth, useFilterOptions } from './lib/hooks';
import type { FilterState } from './types';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 internships per page
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
  const { internships, loading, error } = useInternships(filters);
  const { companies, locations, datePosted } = useFilterOptions();

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
  }, [internships, searchTerm, currentPage, itemsPerPage]);

  const handleFilterChange = (filterType: keyof FilterState, value: string | boolean) => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page
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
  };

  // Reset page when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Results Counter and Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-600">
            <Building2 className="h-5 w-5 mr-2" />
            <span className="text-lg font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allFilteredInternships.length)} of {allFilteredInternships.length} internships
              {allFilteredInternships.length !== internships.length && (
                <span className="text-gray-500 ml-1">({internships.length} total)</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <RefreshStatus />
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

        {/* Internships Display */}
        {!loading && (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-.974-5.709-2.292m11.418 0A7.962 7.962 0 0112 15c2.34 0 4.291-.974 5.709-2.292M15 11V9a3 3 0 00-3-3H9.172a4 4 0 01-2.828-1.172M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any internships matching your criteria. Try running the Python scraper to populate data.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}