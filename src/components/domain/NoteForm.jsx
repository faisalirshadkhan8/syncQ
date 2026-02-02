import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { noteService, NOTE_TYPES } from '@/services/noteService'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Send, Loader2 } from 'lucide-react'

// Validation Schema
const noteSchema = z.object({
    content: z.string()
        .min(1, 'Note content is required')
        .max(2000, 'Note must be less than 2000 characters'),
    note_type: z.string().default('general')
})

/**
 * NoteForm - Form for creating/editing notes
 * Can be used inline or in a modal
 */
const NoteForm = ({ 
    applicationId,
    initialData = null,
    onSuccess,
    onCancel,
    variant = 'default' // 'default' | 'compact'
}) => {
    const queryClient = useQueryClient()
    const isEditing = !!initialData

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch
    } = useForm({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            content: initialData?.content || '',
            note_type: initialData?.note_type || 'general'
        }
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const content = watch('content')

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEditing) {
                return noteService.updateNote(applicationId, initialData.id, data)
            }
            return noteService.createNote(applicationId, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['application', applicationId])
            queryClient.invalidateQueries(['notes', applicationId])
            reset()
            onSuccess?.()
        }
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    const noteTypeOptions = NOTE_TYPES.map(type => ({
        value: type.value,
        label: type.label
    }))

    if (variant === 'compact') {
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="relative">
                    <Textarea
                        placeholder="Add a note about this application..."
                        rows={2}
                        error={errors.content?.message}
                        className="pr-24"
                        {...register('content')}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                        <select
                            {...register('note_type')}
                            className="text-xs bg-slate-100 border-0 rounded-md py-1 px-2 text-slate-600 focus:ring-1 focus:ring-teal-brand-500"
                        >
                            {noteTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!content?.trim() || mutation.isPending}
                            className="h-7 w-7 p-0"
                        >
                            {mutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Send size={14} />
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Note Type */}
            <Select
                label="Note Type"
                options={[{ value: '', label: 'Select type...' }, ...noteTypeOptions]}
                error={errors.note_type?.message}
                {...register('note_type')}
            />

            {/* Content */}
            <div>
                <Textarea
                    label="Note"
                    placeholder="Write your note here..."
                    rows={4}
                    error={errors.content?.message}
                    {...register('content')}
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                    {content?.length || 0} / 2000
                </p>
            </div>

            {/* Error Message */}
            {mutation.isError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                    {mutation.error?.response?.data?.error || 'Failed to save note. Please try again.'}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isSubmitting || mutation.isPending}
                    startIcon={
                        mutation.isPending 
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Send size={16} />
                    }
                >
                    {mutation.isPending 
                        ? 'Saving...' 
                        : isEditing ? 'Update Note' : 'Add Note'
                    }
                </Button>
            </div>
        </form>
    )
}

export default NoteForm
