import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface RefreshStatusProps {
  className?: string;
}

interface RefreshInfo {
  lastRun: Date | null;
  status: 'idle' | 'running' | 'success' | 'error';
  count: number;
  nextUpdate: string;
}

export function RefreshStatus({ className = '' }: RefreshStatusProps) {
  const [refreshInfo, setRefreshInfo] = useState<RefreshInfo>({
    lastRun: null,
    status: 'idle',
    count: 0,
    nextUpdate: 'Unknown'
  });

  useEffect(() => {
    // Fetch real status from API
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (response.ok) {
          setRefreshInfo({
            lastRun: data.lastUpdated ? new Date(data.lastUpdated) : null,
            status: data.isRecent ? 'success' : 'idle',
            count: data.internshipsFound || 0,
            nextUpdate: data.nextUpdate || 'Unknown'
          });
        } else {
          setRefreshInfo({
            lastRun: null,
            status: 'error',
            count: 0,
            nextUpdate: 'Unknown'
          });
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setRefreshInfo({
          lastRun: null,
          status: 'error',
          count: 0,
          nextUpdate: 'Unknown'
        });
      }
    };

    fetchStatus();
    
    // Refresh status every minute
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusIcon = () => {
    switch (refreshInfo.status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (refreshInfo.status) {
      case 'running':
        return 'Syncing...';
      case 'success':
        return `${refreshInfo.count} internships`;
      case 'error':
        return 'Sync failed';
      default:
        return 'Not synced';
    }
  };

  const getStatusColor = () => {
    switch (refreshInfo.status) {
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-xs text-gray-500">
            • Updated {getTimeAgo(refreshInfo.lastRun)}
          </span>
        </div>
        {refreshInfo.status === 'success' && (
          <span className="text-xs text-gray-400">
            Next sync in {refreshInfo.nextUpdate}
          </span>
        )}
      </div>
    </div>
  );
}