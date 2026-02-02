/**
 * Export Center Page
 * Centralized data export management with multiple format options and presets.
 * 
 * @module pages/exports/ExportCenter
 * @see FRONTEND_API_DOCUMENTATION.md Section 11: Exports
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Download, FileText, Building2, Calendar, Package,
  Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, Archive
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import exportService from '@/services/exportService';

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Export type card
 */
function ExportCard({ exportType, onExport, isLoading }) {
  const icons = {
    '📝': FileText,
    '🏢': Building2,
    '🗓️': Calendar,
    '📦': Package
  };

  const IconComponent = icons[exportType.icon] || FileText;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <IconComponent size={24} className="text-indigo-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {exportType.label}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {exportType.description}
          </p>

          <Button
            onClick={() => onExport(exportType)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Export Now
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Export preset card
 */
function PresetCard({ title, description, presets, onExport, isLoading }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>

      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onExport(preset)}
            disabled={isLoading}
            className={cn(
              "w-full px-4 py-3 text-left rounded-lg border border-slate-200",
              "hover:bg-slate-50 hover:border-slate-300 transition-all",
              "flex items-center justify-between",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="text-sm font-medium text-slate-700">{preset.label}</span>
            <Download size={14} className="text-slate-400" />
          </button>
        ))}
      </div>
    </Card>
  );
}

/**
 * Info banner
 */
function InfoBanner() {
  return (
    <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
      <AlertCircle size={20} className="text-indigo-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-indigo-900 mb-1">
          About Data Exports
        </h4>
        <p className="text-sm text-indigo-700">
          All exports are generated in real-time and downloaded directly to your device. 
          CSV files can be opened in Excel, Google Sheets, or any spreadsheet application. 
          The Full Report ZIP contains all your data organized by category.
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExportCenter() {
  const toast = useToast();
  const [currentExport, setCurrentExport] = useState(null);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async ({ action, params }) => {
      setCurrentExport(action);
      await action(params);
    },
    onSuccess: () => {
      toast.success('Export downloaded successfully!');
      setCurrentExport(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Export failed');
      setCurrentExport(null);
    }
  });

  // Get export types
  const exportTypes = exportService.getExportTypes();

  // Handle export
  const handleExport = (exportType) => {
    exportMutation.mutate({
      action: exportType.action,
      params: {}
    });
  };

  // Handle preset export
  const handlePresetExport = (type, preset) => {
    const exportMap = {
      applications: exportService.exportAndDownloadApplications,
      interviews: exportService.exportAndDownloadInterviews
    };

    exportMutation.mutate({
      action: exportMap[type],
      params: preset.params
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Download size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Export Center</h1>
            <p className="text-slate-600">
              Download your data in CSV or ZIP format
            </p>
          </div>
        </div>

        <InfoBanner />
      </div>

      {/* Quick Exports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Exports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportTypes.map((exportType) => (
            <ExportCard
              key={exportType.id}
              exportType={exportType}
              onExport={handleExport}
              isLoading={exportMutation.isPending && currentExport === exportType.action}
            />
          ))}
        </div>
      </div>

      {/* Preset Exports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Filtered Exports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Applications Presets */}
          <PresetCard
            title="Application Exports"
            description="Export applications filtered by status"
            presets={Object.values(exportService.EXPORT_PRESETS.applications)}
            onExport={(preset) => handlePresetExport('applications', preset)}
            isLoading={exportMutation.isPending}
          />

          {/* Interviews Presets */}
          <PresetCard
            title="Interview Exports"
            description="Export interviews filtered by status"
            presets={Object.values(exportService.EXPORT_PRESETS.interviews)}
            onExport={(preset) => handlePresetExport('interviews', preset)}
            isLoading={exportMutation.isPending}
          />
        </div>
      </div>

      {/* Export Tips */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          Export Tips
        </h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Use filtered exports to download specific subsets of your data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Full Report ZIP contains all your data organized by category</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Regular exports are recommended for data backup and analysis</span>
          </li>
        </ul>
      </Card>

      {/* Loading Overlay */}
      {exportMutation.isPending && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4">
            <div className="flex flex-col items-center text-center">
              <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Generating Export
              </h3>
              <p className="text-sm text-slate-600">
                Please wait while we prepare your data...
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
