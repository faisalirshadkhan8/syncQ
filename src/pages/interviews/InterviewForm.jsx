/**
 * InterviewForm Component
 * Form for creating and editing interviews with full validation.
 * 
 * @module pages/interviews/InterviewForm
 */

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Calendar, Clock, MapPin, Video, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { interviewService, INTERVIEW_TYPES } from '@/services/interviewService';
import { applicationService } from '@/services/applicationService';

/**
 * Interview form validation schema
 */
const interviewSchema = z.object({
  application_id: z.string().min(1, 'Please select an application'),
  interview_type: z.string().min(1, 'Please select interview type'),
  scheduled_date: z.string().min(1, 'Please select a date'),
  scheduled_time: z.string().min(1, 'Please select a time'),
  duration_minutes: z.string().optional(),
  location: z.string().optional(),
  meeting_link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  notes: z.string().optional()
});

/**
 * @typedef {Object} InterviewFormProps
 * @property {Object} [interview] - Existing interview for editing
 * @property {number} [applicationId] - Pre-selected application ID
 * @property {Function} onSuccess - Success callback
 * @property {Function} onCancel - Cancel callback
 */

/**
 * Interview form component
 * @param {InterviewFormProps} props
 */
export default function InterviewForm({ interview, applicationId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!interview;

  // Fetch applications for dropdown
  const { data: applicationsData } = useQuery({
    queryKey: ['applications', 'all'],
    queryFn: () => applicationService.getApplications({ per_page: 100 }),
    staleTime: 60000
  });

  // Parse existing interview date/time
  const getDefaultValues = () => {
    if (interview) {
      const date = new Date(interview.scheduled_at);
      return {
        application_id: String(interview.application_id),
        interview_type: interview.interview_type,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        scheduled_time: format(date, 'HH:mm'),
        duration_minutes: interview.duration_minutes ? String(interview.duration_minutes) : '',
        location: interview.location || '',
        meeting_link: interview.meeting_link || '',
        notes: interview.notes || ''
      };
    }
    return {
      application_id: applicationId ? String(applicationId) : '',
      interview_type: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: '60',
      location: '',
      meeting_link: '',
      notes: ''
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(interviewSchema),
    defaultValues: getDefaultValues()
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const interviewType = watch('interview_type');

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => interviewService.createInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Interview scheduled successfully', variant: 'success' });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Failed to schedule interview',
        description: error.response?.data?.message || 'Please try again',
        variant: 'error'
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => interviewService.updateInterview(interview.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview', interview.id] });
      toast({ title: 'Interview updated successfully', variant: 'success' });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update interview',
        description: error.response?.data?.message || 'Please try again',
        variant: 'error'
      });
    }
  });

  const onSubmit = (data) => {
    // Combine date and time
    const scheduled_at = new Date(`${data.scheduled_date}T${data.scheduled_time}`).toISOString();
    
    const payload = {
      application_id: parseInt(data.application_id),
      interview_type: data.interview_type,
      scheduled_at,
      duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      location: data.location || null,
      meeting_link: data.meeting_link || null,
      notes: data.notes || null
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const applications = applicationsData?.applications || [];
  const applicationOptions = applications.map(app => ({
    value: String(app.id),
    label: `${app.company_name} - ${app.job_title}`
  }));

  const typeOptions = Object.entries(INTERVIEW_TYPES).map(([key, config]) => ({
    value: key,
    label: config.label
  }));

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours (Half day)' },
    { value: '480', label: '8 hours (Full day)' }
  ];

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Application Selection */}
      {!applicationId && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Application <span className="text-red-500">*</span>
          </label>
          <Controller
            name="application_id"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[{ value: '', label: 'Select an application...' }, ...applicationOptions]}
                error={errors.application_id?.message}
              />
            )}
          />
          {errors.application_id && (
            <p className="text-sm text-red-500 mt-1">{errors.application_id.message}</p>
          )}
        </div>
      )}

      {/* Interview Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Interview Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="interview_type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={[{ value: '', label: 'Select type...' }, ...typeOptions]}
              error={errors.interview_type?.message}
            />
          )}
        />
        {interviewType && INTERVIEW_TYPES[interviewType] && (
          <p className={cn("text-xs mt-1", INTERVIEW_TYPES[interviewType].color)}>
            {interviewType === 'phone_screen' && 'Initial screening call with recruiter'}
            {interviewType === 'video' && 'Video call interview via Zoom, Teams, etc.'}
            {interviewType === 'onsite' && 'In-person interview at company office'}
            {interviewType === 'technical' && 'Coding challenge or technical assessment'}
            {interviewType === 'behavioral' && 'Questions about past experiences and soft skills'}
            {interviewType === 'panel' && 'Interview with multiple interviewers'}
            {interviewType === 'final' && 'Final round with senior leadership'}
          </p>
        )}
        {errors.interview_type && (
          <p className="text-sm text-red-500 mt-1">{errors.interview_type.message}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Calendar size={14} className="inline mr-1" />
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            {...register('scheduled_date')}
            error={errors.scheduled_date?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Clock size={14} className="inline mr-1" />
            Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="time"
            {...register('scheduled_time')}
            error={errors.scheduled_time?.message}
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Duration
        </label>
        <Controller
          name="duration_minutes"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={[{ value: '', label: 'Not specified' }, ...durationOptions]}
            />
          )}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <MapPin size={14} className="inline mr-1" />
          Location
        </label>
        <Input
          {...register('location')}
          placeholder="e.g., 123 Main St, New York, NY or Building A, Room 301"
        />
        <p className="text-xs text-slate-500 mt-1">
          Physical address for on-site interviews
        </p>
      </div>

      {/* Meeting Link */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <Video size={14} className="inline mr-1" />
          Meeting Link
        </label>
        <Input
          {...register('meeting_link')}
          placeholder="https://zoom.us/j/... or https://teams.microsoft.com/..."
          error={errors.meeting_link?.message}
        />
        <p className="text-xs text-slate-500 mt-1">
          Zoom, Teams, Google Meet, or other video call link
        </p>
      </div>

      {/* Preparation Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <FileText size={14} className="inline mr-1" />
          Preparation Notes
        </label>
        <Textarea
          {...register('notes')}
          rows={4}
          placeholder="Add notes about what to prepare, questions to ask, things to remember..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isEditing ? 'Updating...' : 'Scheduling...'}
            </>
          ) : (
            <>
              {isEditing ? 'Update Interview' : (
                <>
                  <Plus size={16} />
                  Schedule Interview
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
