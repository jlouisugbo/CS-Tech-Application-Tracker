'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExternalLink, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { useAuth, useSavedInternships } from '../../lib/hooks';
import type { SavedInternship } from '../../types';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { savedInternships, updateApplicationStatus, markLinkClicked } = useSavedInternships();
  const [savedInternship, setSavedInternship] = useState<SavedInternship | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [userAction, setUserAction] = useState<'waiting' | 'confirmed' | 'cancelled'>('waiting');

  useEffect(() => {
    const internshipId = params.id as string;
    const saved = savedInternships.find(s => s.internship_id === internshipId);
    setSavedInternship(saved || null);
  }, [params.id, savedInternships]);

  useEffect(() => {
    if (userAction === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (userAction === 'waiting' && countdown === 0) {
      handleApply();
    }
  }, [countdown, userAction]);

  const handleApply = async () => {
    if (!savedInternship) return;
    
    setUserAction('confirmed');
    
    try {
      // Mark as applied and link clicked
      await Promise.all([
        updateApplicationStatus(savedInternship.internship_id, 'applied'),
        markLinkClicked(savedInternship.id)
      ]);
      
      // Open the application link
      /* @ts-ignore */
      if (savedInternship.internships?.application_link) {
        /* @ts-ignore */
        window.open(savedInternship.internships.application_link, '_blank');
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
    
    // Redirect back to dashboard after a delay
    setTimeout(() => {
      router.push('/dashboard?tab=tracker');
    }, 2000);
  };

  const handleCancel = () => {
    setUserAction('cancelled');
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Sign in required</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to track your applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!savedInternship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Internship not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              This internship is not in your saved list.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Internships
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {userAction === 'waiting' && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <ExternalLink className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Apply?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  You're about to apply to this internship. We'll track this application for you.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    {/* @ts-ignore */}
                    <span className="text-white font-bold text-lg">{savedInternship.internships?.company.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {/* @ts-ignore */}
                      {savedInternship.internships?.role}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {/* @ts-ignore */}
                      {savedInternship.internships?.company}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      {/* @ts-ignore */}
                      <span>{savedInternship.internships?.category}</span>
                      {/* @ts-ignore */}
                      <span className="mx-2">•</span>
                      {/* @ts-ignore */}
                      <span>{savedInternship.internships?.locations?.[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-100 mb-4">
                  <span className="text-2xl font-bold text-blue-600">{countdown}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Redirecting to application in {countdown} seconds...
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Apply Now
                </button>
              </div>
            </>
          )}

          {userAction === 'confirmed' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Tracked!</h2>
              <p className="text-sm text-gray-600 mb-4">
                We've marked this application as "Applied" in your dashboard.
                The application page should open in a new tab.
              </p>
              <div className="inline-flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {userAction === 'cancelled' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Cancelled</h2>
              <p className="text-sm text-gray-600">
                No worries! You can apply anytime from your dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}