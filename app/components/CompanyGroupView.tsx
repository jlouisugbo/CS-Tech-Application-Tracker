import React, { useMemo, memo, useState } from 'react';
import { ChevronDown, ChevronRight, Building2, MapPin, Users, GraduationCap, ArrowUpDown } from 'lucide-react';
import type { Internship, CompanyGroup } from '../types';
import { CompactInternshipCard } from './CompactInternshipCard';

interface CompanyGroupViewProps {
  internships: Internship[];
  groupExpanded: Record<string, boolean>;
  onToggleGroup: (company: string) => void;
  itemsPerPage: number;
  currentPage: number;
  companySortBy: string;
  onCompanySortChange: (sort: string) => void;
}

export const CompanyGroupView = memo(function CompanyGroupView({ 
  internships, 
  groupExpanded, 
  onToggleGroup,
  itemsPerPage,
  currentPage,
  companySortBy,
  onCompanySortChange
}: CompanyGroupViewProps) {
  
  // Group internships by company and calculate stats
  const companyGroups = useMemo(() => {
    const groups: Record<string, CompanyGroup> = {};
    
    internships.forEach((internship) => {
      const company = internship.company;
      
      if (!groups[company]) {
        groups[company] = {
          company,
          internships: [],
          totalCount: 0,
          freshmanFriendlyCount: 0,
          openCount: 0,
          isExpanded: groupExpanded[company] || false,
        };
      }
      
      groups[company].internships.push(internship);
      groups[company].totalCount += 1;
      
      if (internship.is_freshman_friendly) {
        groups[company].freshmanFriendlyCount += 1;
      }
      
      if (!internship.is_closed) {
        groups[company].openCount += 1;
      }
    });

    // Sort companies based on companySortBy
    return Object.values(groups).sort((a, b) => {
      switch (companySortBy) {
        case 'alphabetical':
          return a.company.localeCompare(b.company);
        case 'most_open':
          if (a.openCount !== b.openCount) {
            return b.openCount - a.openCount;
          }
          return b.totalCount - a.totalCount;
        case 'most_freshman_friendly':
          if (a.freshmanFriendlyCount !== b.freshmanFriendlyCount) {
            return b.freshmanFriendlyCount - a.freshmanFriendlyCount;
          }
          return b.totalCount - a.totalCount;
        case 'most_positions':
        default:
          return b.totalCount - a.totalCount;
      }
    });
  }, [internships, groupExpanded, companySortBy]);

  // Apply pagination to groups
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return companyGroups.slice(startIndex, endIndex);
  }, [companyGroups, currentPage, itemsPerPage]);

  const handleToggleGroup = (company: string) => {
    onToggleGroup(company);
  };

  // Generate stylized company icon with unique colors
  const getCompanyIcon = (company: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600'
    ];
    
    // Use company name to consistently pick same color
    const colorIndex = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const gradientColor = colors[colorIndex];
    
    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center shadow-sm`}>
        <span className="text-white font-bold text-lg">
          {company.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  const companySortLabels = {
    'most_positions': 'Most Positions',
    'alphabetical': 'Alphabetical',
    'most_open': 'Most Open',
    'most_freshman_friendly': 'Most Freshman Friendly'
  };

  return (
    <div className="space-y-4">
      {/* Company Sort Dropdown */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Sort companies by:</span>
        </div>
        <div className="relative">
          <select
            value={companySortBy}
            onChange={(e) => onCompanySortChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
          >
            {Object.entries(companySortLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      {paginatedGroups.map((group, groupIndex) => (
        <div key={group.company} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Company Header */}
          <div
            onClick={() => handleToggleGroup(group.company)}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 cursor-pointer hover:from-gray-100 hover:to-gray-150 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Company Logo */}
              {getCompanyIcon(group.company)}

              {/* Company Info */}
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.company}
                  </h2>
                  
                  {/* Stats badges */}
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Building2 className="w-4 h-4 mr-1" />
                      {group.totalCount} position{group.totalCount !== 1 ? 's' : ''}
                    </span>
                    
                    {group.openCount !== group.totalCount && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {group.openCount} open
                      </span>
                    )}
                    
                    {group.freshmanFriendlyCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {group.freshmanFriendlyCount} freshman-friendly
                      </span>
                    )}
                  </div>
                </div>

                {/* Location summary */}
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>
                    {(() => {
                      const uniqueLocations = Array.from(new Set(group.internships.flatMap(i => i.locations)));
                      return uniqueLocations.slice(0, 3).join(', ') + 
                        (uniqueLocations.length > 3 ? ` + ${uniqueLocations.length - 3} more` : '');
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {group.isExpanded ? 'Hide' : 'Show'} positions
              </span>
              {group.isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {group.isExpanded && (
            <div className="p-4">
              <div className="space-y-3">
                {group.internships.map((internship, index) => (
                  <CompactInternshipCard
                    key={internship.id}
                    internship={internship}
                    variant="list"
                    isEven={index % 2 === 0}
                  />
                ))}
              </div>
              
              {group.internships.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No matching internships found</p>
                </div>
              )}
            </div>
          )}

          {/* Collapsed Preview */}
          {!group.isExpanded && group.internships.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {group.internships.slice(0, 6).map((internship) => (
                  <span 
                    key={internship.id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-200"
                  >
                    {internship.role.length > 25 ? 
                      `${internship.role.substring(0, 25)}...` : 
                      internship.role
                    }
                    {internship.is_closed && <span className="ml-1 text-gray-400">🔒</span>}
                    {internship.is_freshman_friendly && <span className="ml-1 text-green-600">👨‍🎓</span>}
                  </span>
                ))}
                {group.internships.length > 6 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                    +{group.internships.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {paginatedGroups.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
});