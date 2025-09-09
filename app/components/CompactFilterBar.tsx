import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  GraduationCap, 
  List, 
  Grid3X3, 
  Building2, 
  ChevronDown,
  Search,
  MapPin,
  Clock
} from 'lucide-react';
import type { FilterState } from '../types';
import { INTERNSHIP_CATEGORIES } from '../types';

interface CompactFilterBarProps {
  filters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string | boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  dynamicOptions?: {
    companies?: string[];
    locations?: string[];
    datePosted?: string[];
  };
}

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  displayLabels?: Record<string, string>;
}

function SearchableSelect({ options, value, onChange, placeholder, icon, displayLabels }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(option => {
    const displayText = displayLabels?.[option] || option;
    return displayText.toLowerCase().includes(search.toLowerCase());
  });

  const displayValue = value === 'All' ? placeholder : (displayLabels?.[value] || value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className={value === 'All' ? 'text-gray-500' : 'text-gray-900'}>
            {displayValue}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                    value === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900'
                  }`}
                >
                  {displayLabels?.[option] || option}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CompactFilterBar({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters, 
  dynamicOptions 
}: CompactFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use dynamic options when available, fallback to static options
  const currentOptions = {
    category: ['All', ...INTERNSHIP_CATEGORIES],
    location: dynamicOptions?.locations || [
      'All', 'Remote', 'Atlanta', 'SF Bay Area', 'NYC', 'Seattle', 'Austin', 
      'Boston', 'Chicago', 'Los Angeles', 'Denver', 'Washington DC'
    ],
    company: dynamicOptions?.companies || [
      'All', 'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 
      'NVIDIA', 'IBM', 'Salesforce', 'Oracle', 'Adobe', 'Uber', 'Airbnb'
    ],
    date_posted: dynamicOptions?.datePosted || ['All']
  };

  const citizenshipLabels = {
    'All': 'Any Citizenship',
    'no_citizenship': 'No Citizenship Required',
    'citizenship_required': 'Citizenship Required'
  };

  const sponsorshipLabels = {
    'All': 'Any Sponsorship',
    'sponsorship_ok': 'Visa Sponsorship Available',
    'no_sponsorship': 'No Sponsorship'
  };

  const sortLabels = {
    'date_newest': 'Newest First',
    'date_oldest': 'Oldest First',
    'company_az': 'Company A-Z',
    'company_za': 'Company Z-A'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onFilterChange('view_mode', 'list')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                filters.view_mode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>List</span>
            </button>
            
            <button
              onClick={() => onFilterChange('view_mode', 'grid')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                filters.view_mode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-3 h-3" />
              <span>Grid</span>
            </button>
            
            <button
              onClick={() => onFilterChange('view_mode', 'grouped')}
              className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                filters.view_mode === 'grouped'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Company</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>{isExpanded ? 'Less' : 'More'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Category */}
          <SearchableSelect
            options={currentOptions.category}
            value={filters.category}
            onChange={(value) => onFilterChange('category', value)}
            placeholder="Any Category"
          />

          {/* Location */}
          <SearchableSelect
            options={currentOptions.location}
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
            placeholder="Any Location"
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />

          {/* Company */}
          <SearchableSelect
            options={currentOptions.company}
            value={filters.company}
            onChange={(value) => onFilterChange('company', value)}
            placeholder="Any Company"
            icon={<Building2 className="w-4 h-4 text-gray-400" />}
          />

          {/* Sort */}
          <SearchableSelect
            options={Object.keys(sortLabels)}
            value={filters.sort_by}
            onChange={(value) => onFilterChange('sort_by', value)}
            placeholder="Sort By"
            icon={<Clock className="w-4 h-4 text-gray-400" />}
            displayLabels={sortLabels}
          />
        </div>

        {/* Freshman Friendly Toggle */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.freshman_friendly}
              onChange={(e) => onFilterChange('freshman_friendly', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              Freshman Friendly Only
            </span>
          </label>
        </div>
      </div>

      {/* Extended Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Citizenship */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Citizenship</label>
              <select
                value={filters.citizenship}
                onChange={(e) => onFilterChange('citizenship', e.target.value)}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                {Object.entries(citizenshipLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Sponsorship */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sponsorship</label>
              <select
                value={filters.sponsorship}
                onChange={(e) => onFilterChange('sponsorship', e.target.value)}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                {Object.entries(sponsorshipLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Date Posted */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Posted</label>
              <select
                value={filters.date_posted}
                onChange={(e) => onFilterChange('date_posted', e.target.value)}
                className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                {currentOptions.date_posted.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}