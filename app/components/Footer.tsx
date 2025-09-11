import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">GT CS Internship Portal</h3>
            <p className="text-sm text-gray-600">
              Helping Georgia Tech CS students find Summer 2026 internships
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Data Source:</span>
                <a
                  href="https://github.com/SimplifyJobs/Summer2026-Internships"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Github className="w-4 h-4 mr-1" />
                  SimplifyJobs Repository
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Project:</span>
                <a
                  href="https://github.com/yourusername/gt-cs-internships"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Github className="w-4 h-4 mr-1" />
                  Portal Source Code
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href="https://github.com/yourusername/gt-cs-internships/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  GitHub Actions
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Built with ❤️ for Georgia Tech CS students • Data updated every 30 minutes
          </p>
        </div>
      </div>
    </footer>
  );
}