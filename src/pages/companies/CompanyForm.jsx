import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService, COMPANY_SIZES, INDUSTRIES } from '@/services/companyService'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { Building2, Globe, MapPin, Users, Star, FileText, Save, Loader2, AlertCircle } from 'lucide-react'

// Validation Schema - Company name is required
const companySchema = z.object({
    name: z.string()
        .min(1, 'Please fill in the company name')
        .max(200, 'Company name is too long (max 200 characters)'),
    website: z.string()
        .url('Please enter a valid URL (e.g., https://company.com)')
        .or(z.literal(''))
        .optional(),
    industry: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    size: z.string().optional(),
    glassdoor_rating: z.coerce.number()
        .min(0, 'Rating must be between 0 and 5')
        .max(5, 'Rating must be between 0 and 5')
        .optional()
        .or(z.literal('')),
    notes: z.string().max(2000, 'Notes are too long (max 2000 characters)').optional()
})

const CompanyForm = ({ initialData = null, onSuccess }) => {
    const queryClient = useQueryClient()
    const isEditing = !!initialData

    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: initialData?.name || '',
            website: initialData?.website || '',
            industry: initialData?.industry || '',
            location: initialData?.location || '',
            size: initialData?.size || '',
            glassdoor_rating: initialData?.glassdoor_rating || '',
            notes: initialData?.notes || ''
        }
    })

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: (data) => {
            // Clean empty strings
            const cleanData = { ...data }
            Object.keys(cleanData).forEach(key => {
                if (cleanData[key] === '') cleanData[key] = null
            })
            // Convert glassdoor_rating to number or null
            if (cleanData.glassdoor_rating === '' || cleanData.glassdoor_rating === null) {
                cleanData.glassdoor_rating = null
            } else {
                cleanData.glassdoor_rating = parseFloat(cleanData.glassdoor_rating)
            }

            if (isEditing) {
                return companyService.updateCompany(initialData.id, cleanData)
            }
            return companyService.createCompany(cleanData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            if (isEditing && initialData?.id) {
                queryClient.invalidateQueries({ queryKey: ['company', initialData.id] })
            }
            if (onSuccess) onSuccess()
        }
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    // Industry options with custom option
    const industryOptions = [
        { value: '', label: 'Select industry...' },
        ...INDUSTRIES.map(ind => ({ value: ind, label: ind }))
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name - Required */}
            <Input
                label="Company Name"
                placeholder="e.g., Google, Microsoft, Startup Inc."
                icon={<Building2 size={18} />}
                error={errors.name?.message}
                required
                {...register('name')}
            />

            {/* Website */}
            <Input
                label="Website"
                type="url"
                placeholder="https://company.com"
                icon={<Globe size={18} />}
                error={errors.website?.message}
                {...register('website')}
            />

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Industry */}
                <Select
                    label="Industry"
                    options={industryOptions}
                    error={errors.industry?.message}
                    {...register('industry')}
                />

                {/* Location */}
                <Input
                    label="Location"
                    placeholder="e.g., San Francisco, CA"
                    icon={<MapPin size={18} />}
                    error={errors.location?.message}
                    {...register('location')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Size */}
                <Select
                    label="Company Size"
                    options={COMPANY_SIZES}
                    error={errors.size?.message}
                    {...register('size')}
                />

                {/* Glassdoor Rating */}
                <Input
                    label="Glassdoor Rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="e.g., 4.2"
                    icon={<Star size={18} />}
                    error={errors.glassdoor_rating?.message}
                    {...register('glassdoor_rating')}
                />
            </div>

            {/* Notes */}
            <Textarea
                label="Notes"
                placeholder="Any notes about this company (culture, interview process, etc.)"
                rows={4}
                error={errors.notes?.message}
                {...register('notes')}
            />

            {/* Validation Errors Summary */}
            {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    <div className="flex items-center gap-2 font-medium mb-1">
                        <AlertCircle size={16} />
                        Please fix the following errors:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-600">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>{error.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* API Error Message */}
            {mutation.isError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                    <div className="flex items-center gap-2 font-medium mb-1">
                        <AlertCircle size={16} />
                        Failed to save company
                    </div>
                    <p>
                        {(() => {
                            const errorData = mutation.error?.response?.data;
                            if (typeof errorData === 'string') return errorData;
                            if (errorData?.error) return errorData.error;
                            if (errorData?.detail) return errorData.detail;
                            if (errorData?.name?.[0]) return `Name: ${errorData.name[0]}`;
                            if (errorData?.website?.[0]) return `Website: ${errorData.website[0]}`;
                            // Check for any field errors
                            if (typeof errorData === 'object' && errorData !== null) {
                                const fieldErrors = Object.entries(errorData)
                                    .filter(([, v]) => Array.isArray(v) || typeof v === 'string')
                                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
                                    .join(', ');
                                if (fieldErrors) return fieldErrors;
                            }
                            return 'Please check your input and try again.';
                        })()}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}
                    startIcon={
                        mutation.isPending 
                            ? <Loader2 size={18} className="animate-spin" />
                            : <Save size={18} />
                    }
                >
                    {mutation.isPending 
                        ? 'Saving...' 
                        : isEditing ? 'Update Company' : 'Add Company'
                    }
                </Button>
            </div>
        </form>
    )
}

export default CompanyForm
