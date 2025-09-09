import React from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: string[];
  title: string;
}

export function LocationsModal({ isOpen, onClose, locations, title }: LocationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 max-h-72 overflow-y-auto">
            {locations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No locations specified</p>
            ) : (
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{location}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}