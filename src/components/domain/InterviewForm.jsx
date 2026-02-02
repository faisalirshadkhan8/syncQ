import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { applicationService } from '@/services/applicationService'; // To fetch user's applications
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { format } from 'date-fns';

const interviewTypes = [
    { value: 'phone', label: 'Phone Screen' },
    { value: 'technical', label: 'Technical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'system_design', label: 'System Design' },
    { value: 'coding', label: 'Coding Challenge' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hr', label: 'HR / Final' },
    { value: 'other', label: 'Other' },
];

const schema = z.object({
    application: z.coerce.number().min(1, 'Please select an application'),
    round_number: z.coerce.number().min(1, 'Round number required').default(1),
    interview_type: z.string().min(1, 'Type is required'),
    scheduled_at: z.string().min(1, 'Date & Time is required'), // Start time
    duration_minutes: z.coerce.number().min(15).default(45),
    meeting_link: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
    interviewer_names: z.string().optional(),
    preparation_notes: z.string().optional(),
});

const InterviewForm = ({ onSuccess, initialData, preSelectedApplicationId }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;

    // Fetch user's active applications for the dropdown
    const { data: applicationsObj } = useQuery({
        queryKey: ['applications_list_simple'],
        queryFn: () => applicationService.getApplications({ page_size: 100, status: 'applied,screening,interviewing,offer' }), // Filter relevant statuses
    });

    // Map applications to options for Select
    const applicationOptions = applicationsObj?.results?.map(app => ({
        value: app.id,
        label: `${app.company_name} - ${app.job_title}`
    })) || [];

    const defaultValues = initialData ? {
        ...initialData,
        // Format datetime-local input needs: YYYY-MM-DDTHH:mm
        scheduled_at: initialData.scheduled_at ? format(new Date(initialData.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
    } : {
        application: preSelectedApplicationId || '',
        round_number: 1,
        interview_type: 'phone', // Default
        duration_minutes: 45
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });

    const mutation = useMutation({
        mutationFn: (data) => {
            // Convert local datetime to ISO if needed by backend, or backend might handle it.
            // Zod 'string' allows the raw input. 
            // Usually safest to send ISO string.
            const payload = {
                ...data,
                scheduled_at: new Date(data.scheduled_at).toISOString()
            };

            if (isEditMode) {
                return interviewService.updateInterview(initialData.id, payload);
            }
            return interviewService.createInterview(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviews']);
            if (preSelectedApplicationId) queryClient.invalidateQueries(['application', preSelectedApplicationId]);
            onSuccess?.();
        }
    });

    const onSubmit = (data) => mutation.mutate(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!preSelectedApplicationId && (
                <div className="w-full">
                    <Select
                        label="Application"
                        placeholder="Select Job Application..."
                        options={applicationOptions}
                        error={errors.application}
                        {...register('application')}
                        disabled={isEditMode} // Usually don't change app
                    />
                    {applicationOptions.length === 0 && (
                        <p className="text-xs text-amber-500 mt-1 ml-1">
                            No active applications found. Add an application first.
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Interview Type"
                    options={interviewTypes}
                    error={errors.interview_type}
                    {...register('interview_type')}
                />
                <Input
                    label="Round #"
                    type="number"
                    error={errors.round_number}
                    {...register('round_number')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Date & Time"
                    type="datetime-local"
                    error={errors.scheduled_at}
                    {...register('scheduled_at')}
                    className=""
                />
                <Input
                    label="Duration (mins)"
                    type="number"
                    step="15"
                    error={errors.duration_minutes}
                    {...register('duration_minutes')}
                />
            </div>

            <Input
                label="Meeting Link"
                placeholder="Zoom / Google Meet URL"
                error={errors.meeting_link}
                {...register('meeting_link')}
            />

            <Input
                label="Interviewers"
                placeholder="Names or titles..."
                error={errors.interviewer_names}
                {...register('interviewer_names')}
            />

            <Textarea
                label="Preparation Notes"
                placeholder="Topics to study, questions to ask..."
                {...register('preparation_notes')}
            />

            <div className="flex justify-end pt-4 gap-3">
                {onSuccess && (
                    <Button type="button" variant="ghost" onClick={onSuccess}>Cancel</Button>
                )}
                <Button type="submit" isLoading={mutation.isPending}>
                    {isEditMode ? 'Update Interview' : 'Schedule Interview'}
                </Button>
            </div>
        </form>
    );
};

export default InterviewForm;
