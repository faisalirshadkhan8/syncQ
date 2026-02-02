import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationService } from '@/services/applicationService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

const statusOptions = [
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'offer', label: 'Offer' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'ghosted', label: 'Ghosted' },
];

const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
];

const workTypeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
];

const schema = z.object({
    company_name: z.string().min(1, 'Company Name is required'),
    job_title: z.string().min(1, 'Job Title is required'),
    status: z.string().min(1, 'Status is required'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    work_type: z.enum(['remote', 'hybrid', 'onsite']).default('hybrid'),
    location: z.string().optional(),
    job_url: z.string().url().optional().or(z.literal('')),
    salary_min: z.coerce.number().optional(),
    salary_max: z.coerce.number().optional(),
    job_description: z.string().optional(),
})

const ApplicationForm = ({ onSuccess, initialData }) => {
    const queryClient = useQueryClient()
    const isEditMode = !!initialData

    // Fallback company name if company object is passed (for edit mode)
    // The API returns company details, or we might just have the name
    const defaultValues = initialData ? {
        ...initialData,
        // Ensure company is a string name for editing, backend usually handles name -> ID logic or we might need to adjust
        // For MVP, if we edit, we just keep the name as is or pass ID hidden?
        // Let's assume for update we don't change company easily or just pass name again 
        company_name: initialData.company_name || '',
        salary_min: initialData.salary_min || '',
        salary_max: initialData.salary_max || '',
    } : {
        status: 'applied',
        priority: 'medium',
        work_type: 'hybrid'
    }

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues
    })

    const mutation = useMutation({
        mutationFn: async (data) => {
            // Clean up empty strings for optional numbers
            const payload = {
                ...data,
                salary_min: data.salary_min || null,
                salary_max: data.salary_max || null,
            }

            if (isEditMode) {
                return applicationService.updateApplication(initialData.id, payload)
            } else {
                // Creates company if needed then application
                // Backend expects `company` ID. 
                // We'll create the company first or find it by name. 
                // For MVP simplicity, we'll create a company every time or reuse if name matches?
                // Ideally backend handles "get or create" by name.
                // I'll stick to the previous pattern: Create company first.

                // Note: Real world app would have a company select with async search
                const companyRes = await applicationService.createCompany({ name: data.company_name })
                return applicationService.createApplication({
                    ...payload,
                    company: companyRes.id
                })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['applications'])
            if (isEditMode) queryClient.invalidateQueries(['application', initialData.id])
            onSuccess?.()
        }
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Company Name"
                    placeholder="Google, Amazon..."
                    error={errors.company_name}
                    {...register('company_name')}
                    disabled={isEditMode} // Disable company edit for now to simplify
                />
                <Input
                    label="Job Title"
                    placeholder="Senior Software Engineer"
                    error={errors.job_title}
                    {...register('job_title')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                    label="Status"
                    options={statusOptions}
                    error={errors.status}
                    {...register('status')}
                />
                <Select
                    label="Priority"
                    options={priorityOptions}
                    error={errors.priority}
                    {...register('priority')}
                />
                <Select
                    label="Work Type"
                    options={workTypeOptions}
                    error={errors.work_type}
                    {...register('work_type')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Location"
                    placeholder="Remote / NYC"
                    error={errors.location}
                    {...register('location')}
                />
                <Input
                    label="Job URL"
                    placeholder="https://..."
                    error={errors.job_url}
                    {...register('job_url')}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Salary Min"
                    placeholder="100000"
                    type="number"
                    error={errors.salary_min}
                    {...register('salary_min')}
                />
                <Input
                    label="Salary Max"
                    placeholder="150000"
                    type="number"
                    error={errors.salary_max}
                    {...register('salary_max')}
                />
            </div>

            <Textarea
                label="Job Description / Notes"
                placeholder="Paste the JD or quick notes..."
                {...register('job_description')}
                rows={4}
            />

            <div className="flex justify-end pt-4 gap-3">
                {onSuccess && (
                    <Button type="button" variant="ghost" onClick={onSuccess}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" isLoading={mutation.isPending}>
                    {isEditMode ? 'Update Application' : 'Save Application'}
                </Button>
            </div>
        </form>
    )
}

export default ApplicationForm
