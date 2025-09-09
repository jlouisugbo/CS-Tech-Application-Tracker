'use client'

import React, { useState } from 'react';
import { BookmarkIcon, Calendar, Building2, BarChart3, List, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { useSavedInternships, useAuth } from '../lib/hooks';
import { InternshipCard } from '../components/InternshipCard';
import { ApplicationTracker } from '../components/ApplicationTracker';
import { ApplicationAnalytics } from '../components/ApplicationAnalytics';

export default function DashboardPage() {
  const { user } = useAuth();
  const { savedInternships, loading, error, updateApplicationStatus, addNote, markLinkClicked } = useSavedInternships();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'analytics'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Sign in required</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to view your saved internships.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your saved internships and track your applications
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Application Tracker
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookmarkIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Saved Internships</p>
                <p className="text-2xl font-bold text-gray-900">{savedInternships.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Applied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedInternships.filter(s => s.application_status === 'applied').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Interested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedInternships.filter(s => s.application_status === 'interested').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Internships */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Saved Internships</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">Error loading saved internships: {error}</p>
            </div>
          ) : savedInternships.length === 0 ? (
            <div className="p-12 text-center">
              <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No saved internships</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start browsing internships and save the ones you're interested in!
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {savedInternships.map((saved, index) => (
                <div key={saved.id} className="relative">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      saved.application_status === 'applied' 
                        ? 'bg-green-100 text-green-800'
                        : saved.application_status === 'interested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {saved.application_status}
                    </span>
                  </div>
                  
                  {/* Notes */}
                  {saved.notes && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
                      <strong>Notes:</strong> {saved.notes}
                    </div>
                  )}
                  
                  <InternshipCard 
                    internship={(saved as any).internships} 
                    isEven={index % 2 === 0} 
                  />
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Saved on {new Date(saved.saved_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Application Tracker Tab */}
        {activeTab === 'tracker' && (
          <ApplicationTracker
            savedInternships={savedInternships}
            onUpdateStatus={async (id, status) => {
              const result = await updateApplicationStatus(id, status);
              if (result.error) {
                console.error('Failed to update status:', result.error);
              }
            }}
            onAddNote={async (id, note) => {
              const result = await addNote(id, note);
              if (result.error) {
                console.error('Failed to add note:', result.error);
              }
            }}
            onMarkLinkClicked={async (id) => {
              const result = await markLinkClicked(id);
              if (result.error) {
                console.error('Failed to mark link clicked:', result.error);
              }
            }}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <ApplicationAnalytics savedInternships={savedInternships} />
        )}
      </div>
    </div>
  );
}