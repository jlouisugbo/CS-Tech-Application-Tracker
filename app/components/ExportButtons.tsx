'use client'

import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonsProps {
  filters?: any;
  savedOnly?: boolean;
  userId?: string | null;
  variant?: 'full' | 'compact';
}

export function ExportButtons({
  filters = {},
  savedOnly = false,
  userId = null,
  variant = 'full'
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleCsvExport = async () => {
    try {
      setExporting('csv');

      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, savedOnly, userId })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `internships_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handlePdfExport = async () => {
    try {
      setExporting('pdf');

      // Fetch data for PDF
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, savedOnly, userId })
      });

      if (!response.ok) throw new Error('Export failed');

      const { internships, title, totalCount, exportDate } = await response.json();

      // Generate PDF using jsPDF
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title, 14, 20);

      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total: ${totalCount} internships`, 14, 28);
      doc.text(`Exported: ${new Date(exportDate).toLocaleDateString()}`, 14, 33);

      // Add filters if applicable
      if (filters && filters.category && filters.category !== 'All') {
        doc.text(`Category: ${filters.category}`, 14, 38);
      }

      // Prepare table data
      const headers = savedOnly
        ? ['Company', 'Role', 'Category', 'Status']
        : ['Company', 'Role', 'Category', 'Location'];

      const tableData = internships.map((int: any) => {
        const locations = Array.isArray(int.locations)
          ? int.locations.slice(0, 2).join(', ')
          : int.locations || 'Remote';

        return savedOnly
          ? [
              int.company,
              int.role.length > 40 ? int.role.substring(0, 37) + '...' : int.role,
              int.category,
              int.application_status || 'saved'
            ]
          : [
              int.company,
              int.role.length > 40 ? int.role.substring(0, 37) + '...' : int.role,
              int.category,
              locations.length > 30 ? locations.substring(0, 27) + '...' : locations
            ];
      });

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: filters && filters.category && filters.category !== 'All' ? 43 : 38,
        theme: 'striped',
        headStyles: {
          fillColor: [251, 191, 36], // Yellow-500
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // Gray-50
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Company
          1: { cellWidth: 60 }, // Role
          2: { cellWidth: 40 }, // Category
          3: { cellWidth: 45 }  // Location/Status
        }
      });

      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`internships_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCsvExport}
          disabled={exporting === 'csv'}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-1"
        >
          <Table className="w-4 h-4" />
          {exporting === 'csv' ? <span>Exporting...</span> : <span>CSV</span>}
        </button>
        <button
          onClick={handlePdfExport}
          disabled={exporting === 'pdf'}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-1"
        >
          <FileText className="w-4 h-4" />
          {exporting === 'pdf' ? <span>Exporting...</span> : <span>PDF</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Download className="w-5 h-5 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Export:</span>
      <button
        onClick={handleCsvExport}
        disabled={exporting === 'csv'}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <Table className="w-4 h-4" />
        <span>{exporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
      </button>
      <button
        onClick={handlePdfExport}
        disabled={exporting === 'pdf'}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>{exporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
      </button>
    </div>
  );
}
