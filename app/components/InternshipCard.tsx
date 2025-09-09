import React from 'react';
import { MapPin, Calendar, ExternalLink, Building2, GraduationCap, Flag, Shield, Lock } from 'lucide-react';
import type { Internship } from '../types';
import { useAuth, useIsSaved, useSavedInternships } from '../lib/hooks';

interface InternshipCardProps {
  internship: Internship;
  isEven: boolean;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Full Stack': 'bg-purple-100 text-purple-800 border-purple-200',
    'Front End': 'bg-blue-100 text-blue-800 border-blue-200',
    'Back End': 'bg-green-100 text-green-800 border-green-200',
    'Software Engineering': 'bg-gray-100 text-gray-800 border-gray-200',
    'AI/ML': 'bg-red-100 text-red-800 border-red-200',
    'Data': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Security': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'DevOps': 'bg-orange-100 text-orange-800 border-orange-200',
    'Mobile': 'bg-pink-100 text-pink-800 border-pink-200',
    'Product': 'bg-teal-100 text-teal-800 border-teal-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export function InternshipCard({ internship, isEven }: InternshipCardProps) {
  const { user } = useAuth();
  const { saveInternship, unsaveInternship } = useSavedInternships();
  const { isSaved } = useIsSaved(internship.id);

  const handleSaveToggle = async () => {
    if (!user) return;
    
    if (isSaved) {
      await unsaveInternship(internship.id);
    } else {
      await saveInternship(internship.id);
    }
  };

  return (
    <div 
      className={`${
        isEven ? 'bg-white' : 'bg-gray-50'
      } ${
        internship.is_closed ? 'opacity-60 bg-gray-100' : ''
      } rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-yellow-300 group`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
        {/* Company and Position Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            {/* Company Logo Placeholder */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-sm">
                {internship.company.charAt(0)}
              </span>
            </div>
            
            {/* Position Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {internship.role}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(internship.category)}`}>
                  {internship.category}
                </span>
                {internship.is_freshman_friendly && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Freshman Friendly
                  </span>
                )}
                {internship.is_closed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                    <Lock className="h-3 w-3 mr-1" />
                    Closed
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1 mb-2">
                <h4 className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                  {internship.company}
                </h4>
                {internship.is_subsidiary && (
                  <span className="text-xs text-gray-500">(Subsidiary)</span>
                )}
              </div>

              {/* Requirements Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {internship.locations.slice(0, 3).map((location, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </span>
                ))}
                {internship.locations.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    +{internship.locations.length - 3} more locations
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements and Details */}
        <div className="flex flex-col lg:items-end space-y-1 lg:text-right">
          {/* Requirements */}
          <div className="flex flex-wrap gap-2 justify-end">
            {internship.requires_citizenship && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                <Flag className="h-3 w-3 mr-1" />
                US Citizen Required
              </span>
            )}
            {internship.no_sponsorship && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                <Shield className="h-3 w-3 mr-1" />
                No Sponsorship
              </span>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>Posted {internship.date_posted}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            Last updated {new Date(internship.last_seen).toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-1 lg:ml-4">
          {/* Apply Button */}
          {internship.application_link && (
            <button 
              onClick={internship.is_closed ? undefined : () => window.open(internship.application_link!, '_blank')}
              disabled={internship.is_closed}
              className={`w-full lg:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                internship.is_closed 
                  ? 'text-gray-500 bg-gray-300 cursor-not-allowed' 
                  : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group-hover:bg-blue-700 group-hover:shadow-md'
              }`}
            >
              <span>{internship.is_closed ? 'Closed' : 'Apply Now'}</span>
              {!internship.is_closed && <ExternalLink className="ml-2 h-4 w-4" />}
              {internship.is_closed && <Lock className="ml-2 h-4 w-4" />}
            </button>
          )}
          
          {/* Save Button (only show if user is logged in) */}
          {user && (
            <button
              onClick={handleSaveToggle}
              className={`w-full lg:w-auto inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-200 ${
                isSaved
                  ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}