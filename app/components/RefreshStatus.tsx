import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface RefreshStatusProps {
  className?: string;
}

interface RefreshInfo {
  lastRun: Date | null;
  status: 'idle' | 'running' | 'success' | 'error';
  count: number;
  nextRun?: Date;
}

export function RefreshStatus({ className = '' }: RefreshStatusProps) {
  const [refreshInfo, setRefreshInfo] = useState<RefreshInfo>({
    lastRun: null,
    status: 'idle',
    count: 0
  });

  useEffect(() => {
    // Simulate getting refresh status from API or localStorage
    // In a real implementation, this would fetch from your backend
    const mockRefreshData = {
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      status: 'success' as const,
      count: 623,
      nextRun: new Date(Date.now() + 1000 * 60 * 15) // 15 minutes from now
    };
    
    setRefreshInfo(mockRefreshData);
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
            Next sync in ~{Math.ceil((refreshInfo.nextRun!.getTime() - new Date().getTime()) / (1000 * 60))}m
          </span>
        )}
      </div>
    </div>
  );
}