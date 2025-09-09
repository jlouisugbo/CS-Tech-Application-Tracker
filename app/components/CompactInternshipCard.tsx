import React, { memo, useState } from 'react';
import { MapPin, Calendar, ExternalLink, Building2, GraduationCap, Flag, Shield, Lock, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import type { Internship, SavedInternship } from '../types';
import { useAuth, useIsSaved, useSavedInternships } from '../lib/hooks';
import { LocationsModal } from './LocationsModal';
import { CompanyAvatar } from './CompanyAvatar';

interface CompactInternshipCardProps {
  internship: Internship;
  variant: 'list' | 'grid';
  isEven?: boolean;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Software Engineering': 'bg-gray-100 text-gray-800',
    'Full Stack': 'bg-purple-100 text-purple-800',
    'Front End': 'bg-blue-100 text-blue-800',
    'Back End': 'bg-green-100 text-green-800',
    'AI/ML': 'bg-red-100 text-red-800',
    'Data Science': 'bg-red-50 text-red-700',
    'Data Engineering': 'bg-yellow-100 text-yellow-800',
    'DevOps': 'bg-orange-100 text-orange-800',
    'Mobile': 'bg-pink-100 text-pink-800',
    'Security': 'bg-indigo-100 text-indigo-800',
    'Product Management': 'bg-teal-100 text-teal-800',
    'Quant/Trading': 'bg-emerald-100 text-emerald-800',
    'Research': 'bg-violet-100 text-violet-800',
    'Business Analyst': 'bg-slate-100 text-slate-800',
    'Data Analyst': 'bg-amber-100 text-amber-800',
    'Hardware Engineering': 'bg-stone-100 text-stone-800',
    'Systems Engineering': 'bg-zinc-100 text-zinc-800',
    'Cloud Engineering': 'bg-sky-100 text-sky-800',
    'Site Reliability Engineering': 'bg-lime-100 text-lime-800',
    'Information Technology': 'bg-cyan-100 text-cyan-800',
    'Quality Assurance': 'bg-rose-100 text-rose-800',
    'UX/UI Design': 'bg-fuchsia-100 text-fuchsia-800',
    'Sales Engineering': 'bg-green-50 text-green-700',
    'Technical Program Management': 'bg-blue-50 text-blue-700',
    'Other': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const CompactInternshipCard = memo(function CompactInternshipCard({ internship, variant, isEven = false }: CompactInternshipCardProps) {
  const { user } = useAuth();
  const { saveInternship, unsaveInternship, savedInternships, markLinkClicked } = useSavedInternships();
  const { isSaved } = useIsSaved(internship.id);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  // Get saved internship data if it exists
  const savedInternship = savedInternships.find(s => s.internship_id === internship.id);

  const handleSaveToggle = async () => {
    if (!user) return;
    if (isSaved) {
      await unsaveInternship(internship.id);
    } else {
      await saveInternship(internship.id);
    }
  };

  const handleApplyClick = () => {
    if (!internship.application_link || internship.is_closed) return;
    
    // If saved, use verification flow, otherwise direct link
    if (savedInternship) {
      // Navigate to verification page
      window.location.href = `/apply/${internship.id}`;
    } else {
      // Direct application for unsaved internships
      window.open(internship.application_link, '_blank');
    }
  };

  const getStatusIcon = (status: SavedInternship['application_status']) => {
    switch (status) {
      case 'applied': return CheckCircle;
      case 'interviewing': return Users;
      case 'offer': return TrendingUp;
      case 'interested': return Clock;
      default: return Building2;
    }
  };

  const getStatusColor = (status: SavedInternship['application_status']) => {
    switch (status) {
      case 'applied': return 'text-green-600';
      case 'interviewing': return 'text-purple-600';
      case 'offer': return 'text-emerald-600';
      case 'interested': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  if (variant === 'grid') {
    return (
      <div className={`${
        internship.is_closed ? 'opacity-60 bg-gray-100' : isEven ? 'bg-white' : 'bg-gray-50'
      } rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200 hover:border-yellow-300 group flex flex-col h-full`}>
        
        {/* Header with company avatar and action button */}
        <div className="flex items-center justify-between mb-2">
          <CompanyAvatar company={internship.company} size="md" />
          
          <div className="flex space-x-1">
            {user && (
              <button
                onClick={handleSaveToggle}
                className={`p-1 rounded ${isSaved ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
            
            {/* Status indicator or Apply button */}
            {savedInternship && savedInternship.application_status !== 'saved' ? (
              <div className={`p-1 rounded ${getStatusColor(savedInternship.application_status)}`} title={savedInternship.application_status}>
                {React.createElement(getStatusIcon(savedInternship.application_status), { className: 'w-4 h-4' })}
              </div>
            ) : internship.application_link && (
              <button
                onClick={handleApplyClick}
                disabled={internship.is_closed}
                className={`p-1 rounded transition-colors ${
                  internship.is_closed 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {internship.is_closed ? <Lock className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Role title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
          {internship.role}
        </h3>

        {/* Company name */}
        <p className="text-xs font-medium text-blue-600 mb-1 truncate">
          {internship.company}
        </p>

        {/* Category and status badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(internship.category)}`}>
            {internship.category === 'Software Engineering' ? 'SWE' : 
             internship.category === 'Information Technology' ? 'IT' :
             internship.category === 'Site Reliability Engineering' ? 'SRE' :
             internship.category === 'Product Management' ? 'PM' :
             internship.category === 'Technical Program Management' ? 'TPM' :
             internship.category === 'Quality Assurance' ? 'QA' :
             internship.category === 'UX/UI Design' ? 'UX/UI' :
             internship.category === 'Business Analyst' ? 'BA' :
             internship.category === 'Data Engineering' ? 'Data Eng' :
             internship.category === 'Hardware Engineering' ? 'Hardware' :
             internship.category === 'Systems Engineering' ? 'Systems' :
             internship.category === 'Cloud Engineering' ? 'Cloud' :
             internship.category === 'Sales Engineering' ? 'Sales Eng' :
             internship.category}
          </span>
          
          {internship.is_freshman_friendly && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Fresh
            </span>
          )}
          
          {internship.is_closed && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Closed
            </span>
          )}
        </div>

        {/* Location and requirements - push to bottom */}
        <div className="text-xs text-gray-600 space-y-1 mt-auto">
          <button 
            onClick={() => setShowLocationsModal(true)}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {internship.locations[0]}
              {internship.locations.length > 1 && ` +${internship.locations.length - 1}`}
            </span>
          </button>
          
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span>{internship.date_posted}</span>
            
            {(internship.requires_citizenship || internship.no_sponsorship) && (
              <div className="ml-2 flex space-x-1">
                {internship.requires_citizenship && <Flag className="w-3 h-3 text-red-600" />}
                {internship.no_sponsorship && <Shield className="w-3 h-3 text-orange-600" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List variant - ultra-compact single line
  return (
    <div className={`${
      internship.is_closed ? 'opacity-60 bg-gray-100' : isEven ? 'bg-white' : 'bg-gray-50'
    } rounded-lg border border-gray-200 px-4 py-2 hover:shadow-sm transition-all duration-200 hover:border-yellow-300 group`}>
      
      <div className="flex items-center space-x-4">
        {/* Company logo */}
        <div className="flex-shrink-0">
          <CompanyAvatar company={internship.company} size="md" />
        </div>

        {/* Main content - flexible layout */}
        <div className="flex-1 min-w-0 flex items-center space-x-4">
          {/* Role and Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {internship.role}
              </h3>
              <span className="text-xs text-blue-600 font-medium truncate">
                @ {internship.company}
              </span>
            </div>
          </div>

          {/* Category badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(internship.category)}`}>
              {internship.category === 'Software Engineering' ? 'SWE' : 
               internship.category === 'Information Technology' ? 'IT' :
               internship.category === 'Site Reliability Engineering' ? 'SRE' :
               internship.category === 'Product Management' ? 'PM' :
               internship.category === 'Technical Program Management' ? 'TPM' :
               internship.category === 'Quality Assurance' ? 'QA' :
               internship.category === 'UX/UI Design' ? 'UX/UI' :
               internship.category === 'Business Analyst' ? 'BA' :
               internship.category === 'Data Engineering' ? 'Data Eng' :
               internship.category === 'Hardware Engineering' ? 'Hardware' :
               internship.category === 'Systems Engineering' ? 'Systems' :
               internship.category === 'Cloud Engineering' ? 'Cloud' :
               internship.category === 'Sales Engineering' ? 'Sales Eng' :
               internship.category}
            </span>
          </div>

          {/* Location */}
          <button 
            onClick={() => setShowLocationsModal(true)}
            className="hidden sm:flex flex-shrink-0 items-center text-xs text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MapPin className="w-3 h-3 mr-1" />
            <span className="max-w-24 truncate">
              {internship.locations[0]}
              {internship.locations.length > 1 && ` +${internship.locations.length - 1}`}
            </span>
          </button>

          {/* Status indicators */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {internship.is_freshman_friendly && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Freshman Friendly" />
            )}
            
            {internship.requires_citizenship && (
              <div title="US Citizenship Required">
                <Flag className="w-3 h-3 text-red-600" />
              </div>
            )}
            
            {internship.no_sponsorship && (
              <div title="No Sponsorship">
                <Shield className="w-3 h-3 text-orange-600" />
              </div>
            )}
            
            {internship.is_closed && (
              <div title="Closed">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </div>

          {/* Date */}
          <div className="hidden md:flex flex-shrink-0 text-xs text-gray-500">
            {internship.date_posted}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-2">
          {user && (
            <button
              onClick={handleSaveToggle}
              className={`p-1 rounded transition-colors ${isSaved ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
          
          {savedInternship && savedInternship.application_status !== 'saved' ? (
            <div className={`flex items-center px-3 py-1 text-xs font-medium rounded-md ${
              savedInternship.application_status === 'applied' ? 'bg-green-100 text-green-800' :
              savedInternship.application_status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
              savedInternship.application_status === 'offer' ? 'bg-emerald-100 text-emerald-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {React.createElement(getStatusIcon(savedInternship.application_status), { className: 'w-3 h-3 mr-1' })}
              {savedInternship.application_status}
            </div>
          ) : internship.application_link && (
            <button
              onClick={handleApplyClick}
              disabled={internship.is_closed}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                internship.is_closed 
                  ? 'text-gray-500 bg-gray-200 cursor-not-allowed' 
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {internship.is_closed ? 'Closed' : 'Apply'}
            </button>
          )}
        </div>
      </div>
      
      <LocationsModal
        isOpen={showLocationsModal}
        onClose={() => setShowLocationsModal(false)}
        locations={internship.locations}
        title={`${internship.company} Locations`}
      />
    </div>
  );
});