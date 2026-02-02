/**
 * Resume List Page
 * Comprehensive resume/CV management with upload, preview, and organization.
 * 
 * @module pages/resumes/ResumeList
 * @see FRONTEND_API_DOCUMENTATION.md Section 4: Applications - Resume Management
 */

import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  FileText, Upload, Download, Trash2, Star, Eye, MoreVertical,
  Check, X, Loader2, File, AlertCircle, Plus, Search,
  FileType, Calendar, HardDrive, Edit2, CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import resumeService, {
  validateResumeFile,
  formatFileSize,
  MAX_FILE_SIZE_DISPLAY
} from '@/services/resumeService';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Opens a file URL in a new tab (works around CORS/OpaqueResponseBlocking)
 * Handles both full Cloudinary URLs and relative API paths
 */
const openFileInNewTab = (url) => {
  if (!url) {
    console.error('No URL provided to openFileInNewTab');
    return;
  }
  
  // If it's already a full URL (starts with http:// or https://), use it directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // If it's a relative path, it might be a backend download endpoint
    // Construct the full API URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const fullURL = url.startsWith('/') ? `${baseURL.replace('/api/v1', '')}${url}` : `${baseURL}/${url}`;
    console.log('Opening file URL:', fullURL);
    window.open(fullURL, '_blank', 'noopener,noreferrer');
  }
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * File type icon component
 */
function FileTypeIcon({ filename, className }) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  
  if (ext === 'pdf') {
    return (
      <div className={cn("w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center", className)}>
        <FileText size={24} className="text-rose-600" />
      </div>
    );
  }
  
  if (ext === 'doc' || ext === 'docx') {
    return (
      <div className={cn("w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center", className)}>
        <FileType size={24} className="text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className={cn("w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center", className)}>
      <File size={24} className="text-slate-600" />
    </div>
  );
}

/**
 * Upload progress indicator
 */
function UploadProgress({ progress, filename }) {
  return (
    <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
      <div className="flex items-center gap-3 mb-3">
        <Loader2 size={20} className="text-teal-600 animate-spin" />
        <span className="text-sm font-medium text-teal-700">Uploading {filename}...</span>
      </div>
      <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-teal-600 text-right">{progress}%</div>
    </div>
  );
}

/**
 * Resume card component
 */
function ResumeCard({ resume, onSetDefault, onDelete, onPreview, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card className={cn(
      "p-5 transition-all duration-200 hover:shadow-md",
      resume.is_default && "ring-2 ring-teal-500 ring-offset-2"
    )}>
      <div className="flex items-start gap-4">
        <FileTypeIcon filename={resume.file_name} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              {resume.version_name}
            </h3>
            {resume.is_default && (
              <Badge variant="success" size="sm">
                <Star size={10} className="mr-1" fill="currentColor" />
                Default
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-slate-500 truncate mb-3">
            {resume.file_name}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <HardDrive size={12} />
              {resume.file_size_display || formatFileSize(resume.file_size)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(resume.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="More actions"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in">
              <button
                onClick={() => { onPreview(resume); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye size={16} />
                Preview / Download
              </button>
              <button
                onClick={() => { onRename(resume); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit2 size={16} />
                Rename
              </button>
              {!resume.is_default && (
                <button
                  onClick={() => { onSetDefault(resume.id); setMenuOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Star size={16} />
                  Set as Default
                </button>
              )}
              <hr className="my-1 border-slate-100" />
              <button
                onClick={() => { onDelete(resume); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(resume)}
          className="flex-1"
        >
          <Eye size={14} className="mr-1.5" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(resume)}
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <Trash2 size={14} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1"
          onClick={() => openFileInNewTab(resume.file_url)}
        >
          <Download size={14} className="mr-1.5" />
          Download
        </Button>
      </div>
    </Card>
  );
}

/**
 * Upload drop zone component
 */
function UploadDropZone({ onFileSelect, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={cn(
        "relative p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer",
        isDragging 
          ? "border-teal-500 bg-teal-50" 
          : "border-slate-200 hover:border-teal-400 hover:bg-slate-50",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="hidden"
      />
      
      <div className="text-center">
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors",
          isDragging ? "bg-teal-100" : "bg-slate-100"
        )}>
          <Upload size={28} className={isDragging ? "text-teal-600" : "text-slate-400"} />
        </div>
        
        <p className="text-lg font-semibold text-slate-900 mb-1">
          {isDragging ? 'Drop your resume here' : 'Upload a Resume'}
        </p>
        <p className="text-sm text-slate-500 mb-3">
          Drag and drop or click to browse
        </p>
        <p className="text-xs text-slate-400">
          PDF or Word documents up to {MAX_FILE_SIZE_DISPLAY}
        </p>
      </div>
    </div>
  );
}

/**
 * Upload modal with version name input
 */
function UploadModal({ isOpen, onClose, file, onUpload, isUploading, progress }) {
  const [versionName, setVersionName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (file) {
      // Generate default version name from filename
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setVersionName(name);
    }
  }, [file]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!versionName.trim()) {
      setError('Please enter a version name');
      return;
    }
    onUpload(file, versionName.trim(), isDefault);
  };

  if (!file) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Resume" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
          <FileTypeIcon filename={file.name} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">{file.name}</p>
            <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
          </div>
          <CheckCircle2 size={20} className="text-emerald-500" />
        </div>

        {/* Version Name */}
        <Input
          label="Version Name"
          placeholder="e.g., Software Engineer Resume, Frontend Focus"
          value={versionName}
          onChange={(e) => { setVersionName(e.target.value); setError(''); }}
          error={error}
          required
        />

        {/* Set as Default */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            isDefault 
              ? "bg-teal-500 border-teal-500" 
              : "border-slate-300 hover:border-teal-400"
          )}>
            {isDefault && <Check size={14} className="text-white" />}
          </div>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm text-slate-700">Set as default resume</span>
        </label>

        {/* Upload Progress */}
        {isUploading && (
          <UploadProgress progress={progress} filename={file.name} />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Rename modal
 */
function RenameModal({ isOpen, onClose, resume, onRename, isLoading }) {
  const [name, setName] = useState(resume?.version_name || '');

  React.useEffect(() => {
    if (resume) setName(resume.version_name);
  }, [resume]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(resume.id, name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Resume" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Version Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this resume"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Loading skeleton
 */
function ResumeListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResumeList() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingResume, setDeletingResume] = useState(null);
  const [renamingResume, setRenamingResume] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch resumes
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes()
  });

  const resumes = React.useMemo(() => data?.results || [], [data]);
  
  // Debug: Log resume data to help diagnose URL issues
  React.useEffect(() => {
    if (resumes.length > 0) {
      console.log('Resume data received:', resumes[0]);
      console.log('Sample file_url:', resumes[0]?.file_url);
    }
  }, [resumes]);

  // Filter resumes by search
  const filteredResumes = resumes.filter(resume =>
    resume.version_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, versionName, isDefault }) => 
      resumeService.uploadResume(file, versionName, isDefault, setUploadProgress),
    onSuccess: () => {
      toast.success('Resume uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    }
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id) => resumeService.setDefaultResume(id),
    onSuccess: () => {
      toast.success('Default resume updated!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: () => {
      toast.error('Could not set default resume. Please try again.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => resumeService.deleteResume(id),
    onSuccess: () => {
      toast.success('Resume deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setDeletingResume(null);
    },
    onError: () => {
      toast.error('Could not delete resume. Please try again.');
    }
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, versionName }) => resumeService.updateResume(id, { version_name: versionName }),
    onSuccess: () => {
      toast.success('Resume renamed successfully!');
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setRenamingResume(null);
    },
    onError: () => {
      toast.error('Could not rename resume. Please try again.');
    }
  });

  // Handle file selection
  const handleFileSelect = (file) => {
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setSelectedFile(file);
    setIsUploadModalOpen(true);
  };

  // Handle upload
  const handleUpload = (file, versionName, isDefault) => {
    uploadMutation.mutate({ file, versionName, isDefault });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container py-8 max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Resumes</h1>
            <p className="text-slate-500 mt-1">
              Manage your resume versions for different applications
            </p>
          </div>
          <Button onClick={() => document.getElementById('file-upload-trigger')?.click()}>
            <Plus size={18} className="mr-2" />
            Upload Resume
          </Button>
          <input
            id="file-upload-trigger"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Upload Drop Zone */}
        {resumes.length === 0 && !isLoading ? (
          <Card className="mb-8 p-0 overflow-hidden">
            <UploadDropZone 
              onFileSelect={handleFileSelect} 
              isUploading={uploadMutation.isPending}
            />
          </Card>
        ) : (
          /* Search Bar */
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Resumes Grid */}
        {isLoading ? (
          <ResumeListSkeleton />
        ) : isError ? (
          <Card className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load resumes</h3>
            <p className="text-slate-500 mb-4">
              {error?.response?.data?.detail || error?.message || 'There was an error loading your resumes.'}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['resumes'] })}>
              Try Again
            </Button>
          </Card>
        ) : filteredResumes.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No resumes found"
              description={`No resumes match "${searchQuery}"`}
              action={
                <Button variant="ghost" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Upload your first resume to get started"
              action={
                <Button onClick={() => document.getElementById('file-upload-trigger')?.click()}>
                  <Upload size={16} className="mr-2" />
                  Upload Resume
                </Button>
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upload Card (always shown when there are resumes) */}
            <Card 
              className="p-5 border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
              onClick={() => document.getElementById('file-upload-trigger')?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Plus size={24} className="text-slate-400" />
              </div>
              <p className="font-medium text-slate-600">Upload New Resume</p>
              <p className="text-xs text-slate-400 mt-1">PDF or Word</p>
            </Card>

            {/* Resume Cards */}
            {filteredResumes.map(resume => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onSetDefault={(id) => setDefaultMutation.mutate(id)}
                onDelete={(resume) => setDeletingResume(resume)}
                onPreview={(resume) => setPreviewResume(resume)}
                onRename={(resume) => setRenamingResume(resume)}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
          file={selectedFile}
          onUpload={handleUpload}
          isUploading={uploadMutation.isPending}
          progress={uploadProgress}
        />

        {/* Rename Modal */}
        <RenameModal
          isOpen={!!renamingResume}
          onClose={() => setRenamingResume(null)}
          resume={renamingResume}
          onRename={(id, name) => renameMutation.mutate({ id, versionName: name })}
          isLoading={renameMutation.isPending}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deletingResume}
          onClose={() => setDeletingResume(null)}
          onConfirm={() => deleteMutation.mutate(deletingResume?.id)}
          isLoading={deleteMutation.isPending}
          title="Delete Resume"
          description={`Are you sure you want to delete "${deletingResume?.version_name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isDestructive
        />

        {/* Preview Modal */}
        <Modal
          isOpen={!!previewResume}
          onClose={() => setPreviewResume(null)}
          title={previewResume?.version_name || 'Resume Preview'}
          size="lg"
        >
          {previewResume && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <FileTypeIcon filename={previewResume.file_name} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{previewResume.file_name}</p>
                  <p className="text-sm text-slate-500">
                    {previewResume.file_size_display || formatFileSize(previewResume.file_size)} • 
                    Uploaded {format(new Date(previewResume.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
                {previewResume.is_default && (
                  <Badge variant="success">Default</Badge>
                )}
              </div>

              {/* Preview Action - Opens in browser's native PDF viewer */}
              <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                  <FileText size={32} className="text-indigo-600" />
                </div>
                <p className="text-slate-600 text-center mb-6 max-w-sm">
                  Click below to preview your resume in a new tab with full zoom, search, and print capabilities.
                </p>
                <Button
                  onClick={() => openFileInNewTab(previewResume.file_url)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Eye size={18} />
                  Preview Resume
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button onClick={() => openFileInNewTab(previewResume.file_url)}>
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
