/**
 * InterviewDetail Page
 * Comprehensive interview detail view with preparation notes,
 * interviewer information, and outcome tracking.
 * 
 * @module pages/interviews/InterviewDetail
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Clock, MapPin, Video, Phone, Building2, Code, Users, Users2, Award,
  ArrowLeft, ExternalLink, Edit2, Trash2, CheckCircle, XCircle, AlertCircle,
  Loader2, Copy, Check, User, Mail, Linkedin, FileText, MessageSquare
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isFuture, isToday } from 'date-fns';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import {
  interviewService,
  getInterviewTypeConfig,
  getInterviewOutcomeConfig,
  INTERVIEW_TYPES,
  INTERVIEW_OUTCOMES,
  formatDuration
} from '@/services/interviewService';
import InterviewForm from './InterviewForm';

// Icon mapping
const TYPE_ICONS = {
  Phone,
  Video,
  Building2,
  Code,
  Users,
  Users2,
  Award,
  Calendar
};

/**
 * Info row component for details
 */
// eslint-disable-next-line no-unused-vars
function InfoRow({ icon: Icon, label, value, className }) {
  if (!value) return null;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Icon size={18} className="text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-700 font-medium">{value}</p>
      </div>
    </div>
  );
}

/**
 * Interviewer card component
 */
function InterviewerCard({ interviewer }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
      <div className="w-10 h-10 rounded-full bg-teal-brand-100 flex items-center justify-center text-teal-brand-600">
        <User size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{interviewer.name}</p>
        {interviewer.title && (
          <p className="text-xs text-slate-500 truncate">{interviewer.title}</p>
        )}
      </div>
      {interviewer.email && (
        <a
          href={`mailto:${interviewer.email}`}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          title="Send email"
        >
          <Mail size={16} />
        </a>
      )}
      {interviewer.linkedin_url && (
        <a
          href={interviewer.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors"
          title="View LinkedIn"
        >
          <Linkedin size={16} />
        </a>
      )}
    </div>
  );
}

/**
 * Loading skeleton for interview detail
 */
function InterviewDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Interview Detail Page Component
 */
export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch interview details
  const { data: interview, isLoading, isError } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewService.getInterview(id)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => interviewService.deleteInterview(id),
    onSuccess: () => {
      toast({ title: 'Interview deleted', variant: 'success' });
      navigate('/interviews');
    },
    onError: () => {
      toast({ title: 'Failed to delete interview', variant: 'error' });
    }
  });

  // Update outcome mutation
  const outcomeMutation = useMutation({
    mutationFn: ({ outcome, notes }) => interviewService.updateOutcome(id, outcome, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', id] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Outcome updated', variant: 'success' });
      setIsOutcomeOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to update outcome', variant: 'error' });
    }
  });

  // Copy meeting link
  const handleCopyLink = async () => {
    if (interview?.meeting_link) {
      await navigator.clipboard.writeText(interview.meeting_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link copied to clipboard', variant: 'success' });
    }
  };

  if (isLoading) {
    return <InterviewDetailSkeleton />;
  }

  if (isError || !interview) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Interview Not Found</h2>
        <p className="text-slate-500 mb-4">The interview you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/interviews')}>
          <ArrowLeft size={16} />
          Back to Interviews
        </Button>
      </div>
    );
  }

  const typeConfig = getInterviewTypeConfig(interview.interview_type);
  const outcomeConfig = getInterviewOutcomeConfig(interview.outcome);
  const TypeIcon = TYPE_ICONS[typeConfig.icon] || Calendar;
  const interviewDate = new Date(interview.scheduled_at);
  const isPastInterview = isPast(interviewDate);
  const isUpcoming = isFuture(interviewDate);
  const isTodayInterview = isToday(interviewDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/interviews')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mt-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                typeConfig.bgColor,
                "border",
                typeConfig.borderColor
              )}>
                <TypeIcon size={24} className={typeConfig.color} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {typeConfig.label}
                </h1>
                {interview.application && (
                  <Link
                    to={`/applications/${interview.application.id}`}
                    className="text-sm text-teal-brand-600 hover:text-teal-brand-700 flex items-center gap-1"
                  >
                    {interview.application.company_name} - {interview.application.job_title}
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-start">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit2 size={16} />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Interview Details</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <InfoRow
                icon={Calendar}
                label="Date"
                value={format(interviewDate, 'EEEE, MMMM d, yyyy')}
              />
              <InfoRow
                icon={Clock}
                label="Time"
                value={format(interviewDate, 'h:mm a')}
              />
              {interview.duration_minutes && (
                <InfoRow
                  icon={Clock}
                  label="Duration"
                  value={formatDuration(interview.duration_minutes)}
                />
              )}
              {interview.location && (
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={interview.location}
                />
              )}
              {interview.meeting_link && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Video size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Meeting Link</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-brand-600 hover:text-teal-brand-700 truncate max-w-[300px]"
                      >
                        {interview.meeting_link}
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {isUpcoming && interview.meeting_link && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full sm:w-auto">
                    <Video size={16} />
                    Join Meeting
                  </Button>
                </a>
              </div>
            )}
          </Card>

          {/* Preparation Notes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Preparation Notes</h2>
              <FileText size={18} className="text-slate-400" />
            </div>
            {interview.notes ? (
              <div className="prose prose-sm prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-wrap">{interview.notes}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">No preparation notes added</p>
            )}
          </Card>

          {/* Interviewers */}
          {interview.interviewers && interview.interviewers.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Interviewers ({interview.interviewers.length})
                </h2>
                <Users size={18} className="text-slate-400" />
              </div>
              <div className="space-y-3">
                {interview.interviewers.map((interviewer) => (
                  <InterviewerCard key={interviewer.id} interviewer={interviewer} />
                ))}
              </div>
            </Card>
          )}

          {/* Outcome Notes */}
          {interview.outcome_notes && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Outcome Notes</h2>
                <MessageSquare size={18} className="text-slate-400" />
              </div>
              <div className="prose prose-sm prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-wrap">{interview.outcome_notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Status</h3>
            
            {/* Time Status */}
            <div className={cn(
              "p-4 rounded-lg mb-4",
              isTodayInterview && "bg-amber-50 border border-amber-200",
              isUpcoming && !isTodayInterview && "bg-blue-50 border border-blue-200",
              isPastInterview && "bg-slate-50 border border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                {isTodayInterview && (
                  <>
                    <AlertCircle size={20} className="text-amber-600" />
                    <div>
                      <p className="font-semibold text-amber-800">Today!</p>
                      <p className="text-sm text-amber-600">
                        {format(interviewDate, 'h:mm a')}
                      </p>
                    </div>
                  </>
                )}
                {isUpcoming && !isTodayInterview && (
                  <>
                    <Clock size={20} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800">Upcoming</p>
                      <p className="text-sm text-blue-600">
                        {formatDistanceToNow(interviewDate, { addSuffix: true })}
                      </p>
                    </div>
                  </>
                )}
                {isPastInterview && (
                  <>
                    <CheckCircle size={20} className="text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-700">Completed</p>
                      <p className="text-sm text-slate-500">
                        {formatDistanceToNow(interviewDate, { addSuffix: true })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Outcome</p>
              <Badge variant={outcomeConfig.bgColor} className={cn(outcomeConfig.color, "text-sm")}>
                {outcomeConfig.label}
              </Badge>
            </div>

            {/* Update Outcome Button */}
            {(isPastInterview || interview.outcome === 'scheduled') && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsOutcomeOpen(true)}
              >
                Update Outcome
              </Button>
            )}
          </Card>

          {/* Application Quick View */}
          {interview.application && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Application</h3>
              <Link
                to={`/applications/${interview.application.id}`}
                className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
              >
                <p className="font-medium text-slate-900">{interview.application.company_name}</p>
                <p className="text-sm text-slate-600">{interview.application.job_title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Status: {interview.application.status}
                </p>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Interview"
        size="lg"
      >
        <InterviewForm
          interview={interview}
          onSuccess={() => {
            setIsEditOpen(false);
            queryClient.invalidateQueries({ queryKey: ['interview', id] });
          }}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>

      {/* Outcome Modal */}
      <Modal
        isOpen={isOutcomeOpen}
        onClose={() => setIsOutcomeOpen(false)}
        title="Update Interview Outcome"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            How did the interview go? Select an outcome below.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(INTERVIEW_OUTCOMES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => outcomeMutation.mutate({ outcome: key })}
                disabled={outcomeMutation.isPending}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  "hover:border-teal-brand-300 hover:bg-teal-brand-50",
                  interview.outcome === key && "ring-2 ring-teal-brand-500",
                  outcomeMutation.isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn("text-sm font-medium", config.color)}>
                  {config.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Interview"
        message="Are you sure you want to delete this interview? This action cannot be undone."
        confirmLabel="Delete Interview"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
