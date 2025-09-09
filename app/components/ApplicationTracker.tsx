import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Users, 
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import type { SavedInternship, InterviewRound } from '../types';

interface ApplicationTrackerProps {
  savedInternships: SavedInternship[];
  onUpdateStatus: (id: string, status: SavedInternship['application_status']) => void;
  onAddNote: (id: string, note: string) => void;
  onMarkLinkClicked: (id: string) => void;
}

const statusConfig = {
  saved: { color: 'bg-blue-100 text-blue-800', icon: Building2, label: 'Saved' },
  interested: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Interested' },
  applied: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Applied' },
  interviewing: { color: 'bg-purple-100 text-purple-800', icon: Users, label: 'Interviewing' },
  offer: { color: 'bg-emerald-100 text-emerald-800', icon: TrendingUp, label: 'Offer' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  accepted: { color: 'bg-green-200 text-green-900', icon: CheckCircle, label: 'Accepted' },
  ghosted: { color: 'bg-gray-100 text-gray-600', icon: AlertCircle, label: 'Ghosted' },
  withdrawn: { color: 'bg-orange-100 text-orange-800', icon: ArrowRight, label: 'Withdrawn' }
};

export function ApplicationTracker({ 
  savedInternships, 
  onUpdateStatus, 
  onAddNote, 
  onMarkLinkClicked 
}: ApplicationTrackerProps) {
  const [selectedStatus, setSelectedStatus] = useState<SavedInternship['application_status'] | 'all'>('all');
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  // Calculate application statistics
  const stats = useMemo(() => {
    const total = savedInternships.length;
    const applied = savedInternships.filter(s => s.application_status === 'applied').length;
    const interviewing = savedInternships.filter(s => s.application_status === 'interviewing').length;
    const offers = savedInternships.filter(s => s.application_status === 'offer').length;
    const responseRate = total > 0 ? Math.round(((interviewing + offers) / applied) * 100) : 0;
    
    return { total, applied, interviewing, offers, responseRate };
  }, [savedInternships]);

  // Filter internships by status
  const filteredInternships = useMemo(() => {
    return selectedStatus === 'all' 
      ? savedInternships 
      : savedInternships.filter(s => s.application_status === selectedStatus);
  }, [savedInternships, selectedStatus]);

  const handleAddNote = (id: string) => {
    const note = noteInput[id]?.trim();
    if (note) {
      onAddNote(id, note);
      setNoteInput(prev => ({ ...prev, [id]: '' }));
    }
  };

  const getUpcomingInterviews = () => {
    return savedInternships
      .filter(s => s.interview_rounds?.some(round => 
        round.scheduled_at && 
        new Date(round.scheduled_at) > new Date() && 
        round.result === 'pending'
      ))
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Application Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Saved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Applied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Interviewing</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviewing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Offers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {getUpcomingInterviews().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Interviews
          </h3>
          <div className="space-y-3">
            {getUpcomingInterviews().map((saved) => {
              const nextInterview = saved.interview_rounds?.find(round => 
                round.scheduled_at && 
                new Date(round.scheduled_at) > new Date() && 
                round.result === 'pending'
              );
              return (
                <div key={saved.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {/* @ts-ignore */}
                      {saved.internships?.company} - {saved.internships?.role}
                    </p>
                    <p className="text-sm text-gray-600">
                      {nextInterview?.round_type} • {new Date(nextInterview?.scheduled_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedStatus === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({savedInternships.length})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = savedInternships.filter(s => s.application_status === status).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as SavedInternship['application_status'])}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    selectedStatus === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </nav>
        </div>

        {/* Application List */}
        <div className="divide-y divide-gray-200">
          {filteredInternships.map((saved) => {
            const StatusIcon = statusConfig[saved.application_status].icon;
            const statusColor = statusConfig[saved.application_status].color;
            
            return (
              <div key={saved.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {/* @ts-ignore */}
                        {saved.internships?.company} - {saved.internships?.role}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[saved.application_status].label}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Saved: {new Date(saved.saved_at).toLocaleDateString()}</span>
                      {saved.applied_at && (
                        <span>Applied: {new Date(saved.applied_at).toLocaleDateString()}</span>
                      )}
                      {saved.application_link_clicked_at && (
                        <span className="flex items-center">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Link clicked
                        </span>
                      )}
                    </div>

                    {saved.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{saved.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Update Dropdown */}
                    <select
                      value={saved.application_status}
                      onChange={(e) => onUpdateStatus(saved.id, e.target.value as SavedInternship['application_status'])}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <option key={status} value={status}>
                          {config.label}
                        </option>
                      ))}
                    </select>

                    {/* Apply Button */}
                    {/* @ts-ignore */}
                    {saved.internships?.application_link && saved.application_status === 'saved' && (
                      <button
                        onClick={() => {
                          onMarkLinkClicked(saved.id);
                          /* @ts-ignore */
                          window.open(saved.internships.application_link, '_blank');
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Note Section */}
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={noteInput[saved.id] || ''}
                    onChange={(e) => setNoteInput(prev => ({ ...prev, [saved.id]: e.target.value }))}
                    className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1"
                  />
                  <button
                    onClick={() => handleAddNote(saved.id)}
                    disabled={!noteInput[saved.id]?.trim()}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>

                {/* Interview Rounds */}
                {saved.interview_rounds && saved.interview_rounds.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Interview Progress</h5>
                    <div className="space-y-2">
                      {saved.interview_rounds.map((round) => (
                        <div key={round.id} className="flex items-center space-x-3 text-sm">
                          <span className="w-20 text-gray-600">Round {round.round_number}:</span>
                          <span className="capitalize">{round.round_type}</span>
                          {round.scheduled_at && (
                            <span className="text-gray-500">
                              {new Date(round.scheduled_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            round.result === 'passed' ? 'bg-green-100 text-green-800' :
                            round.result === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {round.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredInternships.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No {selectedStatus !== 'all' ? statusConfig[selectedStatus as keyof typeof statusConfig]?.label.toLowerCase() : ''} internships
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {selectedStatus === 'all' 
                  ? 'Start browsing internships and save the ones you\'re interested in!'
                  : `No internships with ${selectedStatus} status yet.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}