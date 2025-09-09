import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Clock, CheckCircle } from 'lucide-react';
import type { SavedInternship } from '../types';

interface ApplicationAnalyticsProps {
  savedInternships: SavedInternship[];
}

export function ApplicationAnalytics({ savedInternships }: ApplicationAnalyticsProps) {
  const analytics = useMemo(() => {
    const total = savedInternships.length;
    const applied = savedInternships.filter(s => s.application_status === 'applied').length;
    const interviewing = savedInternships.filter(s => s.application_status === 'interviewing').length;
    const offers = savedInternships.filter(s => s.application_status === 'offer').length;
    const rejected = savedInternships.filter(s => s.application_status === 'rejected').length;
    const accepted = savedInternships.filter(s => s.application_status === 'accepted').length;

    // Calculate rates
    const applicationRate = total > 0 ? Math.round((applied / total) * 100) : 0;
    const responseRate = applied > 0 ? Math.round(((interviewing + offers + rejected) / applied) * 100) : 0;
    const interviewRate = applied > 0 ? Math.round((interviewing / applied) * 100) : 0;
    const offerRate = applied > 0 ? Math.round((offers / applied) * 100) : 0;

    // Weekly application trend (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const weeklyApplications = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(fourWeeksAgo);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekApplications = savedInternships.filter(s => 
        s.applied_at && 
        new Date(s.applied_at) >= weekStart && 
        new Date(s.applied_at) <= weekEnd
      ).length;
      
      weeklyApplications.push({
        week: `Week ${i + 1}`,
        applications: weekApplications
      });
    }

    // Company application distribution
    const companyStats = savedInternships.reduce((acc, s) => {
      /* @ts-ignore */
      const company = s.internships?.company || 'Unknown';
      if (!acc[company]) {
        acc[company] = { total: 0, applied: 0, offers: 0 };
      }
      acc[company].total++;
      if (s.application_status === 'applied') acc[company].applied++;
      if (s.application_status === 'offer') acc[company].offers++;
      return acc;
    }, {} as Record<string, { total: number; applied: number; offers: number }>);

    const topCompanies = Object.entries(companyStats)
      .sort(([,a], [,b]) => b.applied - a.applied)
      .slice(0, 5);

    // Application timeline
    const recentActivity = savedInternships
      .filter(s => s.applied_at)
      .sort((a, b) => new Date(b.applied_at!).getTime() - new Date(a.applied_at!).getTime())
      .slice(0, 10);

    return {
      total,
      applied,
      interviewing,
      offers,
      rejected,
      accepted,
      applicationRate,
      responseRate,
      interviewRate,
      offerRate,
      weeklyApplications,
      topCompanies,
      recentActivity
    };
  }, [savedInternships]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Application Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.applicationRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.responseRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Interview Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.interviewRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Offer Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.offerRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Application Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Weekly Application Trend
          </h3>
          <div className="space-y-3">
            {analytics.weeklyApplications.map((week, index) => (
              <div key={index} className="flex items-center">
                <span className="w-16 text-sm text-gray-600">{week.week}</span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max((week.applications / Math.max(...analytics.weeklyApplications.map(w => w.applications), 1)) * 100, 5)}%` 
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{week.applications}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Top Companies Applied
          </h3>
          <div className="space-y-3">
            {analytics.topCompanies.map(([company, stats], index) => (
              <div key={company} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                  <span className="text-sm text-gray-700">{company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{stats.applied} applied</span>
                  {stats.offers > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {stats.offers} offers
                    </span>
                  )}
                </div>
              </div>
            ))}
            {analytics.topCompanies.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No applications yet. Start applying to see insights!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-yellow-500" />
          Recent Application Activity
        </h3>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-md flex items-center justify-center">
                  {/* @ts-ignore */}
                  <span className="text-white font-bold text-xs">{activity.internships?.company.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {/* @ts-ignore */}
                    {activity.internships?.company} - {activity.internships?.role}
                  </p>
                  <p className="text-xs text-gray-500">Applied</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(activity.applied_at!).toLocaleDateString()}
              </span>
            </div>
          ))}
          {analytics.recentActivity.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No application activity yet.
            </p>
          )}
        </div>
      </div>

      {/* Application Flow Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Flow</h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-blue-800">{analytics.total}</span>
            </div>
            <span className="text-xs text-gray-600">Saved</span>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${analytics.applicationRate}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">{analytics.applicationRate}%</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-green-800">{analytics.applied}</span>
            </div>
            <span className="text-xs text-gray-600">Applied</span>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${analytics.interviewRate}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">{analytics.interviewRate}%</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-purple-800">{analytics.interviewing}</span>
            </div>
            <span className="text-xs text-gray-600">Interviewing</span>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: analytics.interviewing > 0 ? `${(analytics.offers / analytics.interviewing) * 100}%` : '0%' }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              {analytics.interviewing > 0 ? Math.round((analytics.offers / analytics.interviewing) * 100) : 0}%
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-emerald-800">{analytics.offers}</span>
            </div>
            <span className="text-xs text-gray-600">Offers</span>
          </div>
        </div>
      </div>
    </div>
  );
}