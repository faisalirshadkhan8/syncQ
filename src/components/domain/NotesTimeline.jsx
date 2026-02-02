import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noteService } from '@/services/noteService'
import NoteCard from './NoteCard'
import NoteForm from './NoteForm'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import { Plus, FileText, MessageSquare } from 'lucide-react'

/**
 * NotesTimeline - Complete notes section with timeline view
 * Used in ApplicationDetail page
 */
const NotesTimeline = ({ 
    applicationId,
    initialNotes = [] // Can receive notes from parent if already fetched
}) => {
    const queryClient = useQueryClient()
    const { success, error: showError } = useToast()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [deletingNote, setDeletingNote] = useState(null)

    // Fetch notes if not provided
    const { data: fetchedNotes, isLoading } = useQuery({
        queryKey: ['notes', applicationId],
        queryFn: () => noteService.getNotes(applicationId),
        enabled: initialNotes.length === 0 && !!applicationId,
        initialData: initialNotes.length > 0 ? initialNotes : undefined
    })

    // Use fetched notes or initial notes
    const notes = fetchedNotes || initialNotes

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (noteId) => noteService.deleteNote(applicationId, noteId),
        onSuccess: () => {
            success('Note deleted')
            queryClient.invalidateQueries(['notes', applicationId])
            queryClient.invalidateQueries(['application', applicationId])
            setDeletingNote(null)
        },
        onError: () => {
            showError('Failed to delete note')
        }
    })

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="w-32 h-6" />
                    <Skeleton className="w-24 h-9 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="w-24 h-4 mb-2" />
                                <Skeleton className="w-full h-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-slate-400" />
                    Notes & Timeline
                    {notes.length > 0 && (
                        <span className="text-sm font-normal text-slate-400">
                            ({notes.length})
                        </span>
                    )}
                </h3>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAddOpen(true)}
                    startIcon={<Plus size={16} />}
                >
                    Add Note
                </Button>
            </div>

            {/* Inline Add Form (compact) */}
            <div className="mb-6">
                <NoteForm
                    applicationId={applicationId}
                    variant="compact"
                    onSuccess={() => {
                        success('Note added')
                        queryClient.invalidateQueries(['notes', applicationId])
                        queryClient.invalidateQueries(['application', applicationId])
                    }}
                />
            </div>

            {/* Notes List */}
            {notes.length > 0 ? (
                <div className="space-y-0">
                    {notes.map((note, index) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isFirst={index === 0}
                            isLast={index === notes.length - 1}
                            onEdit={(note) => setEditingNote(note)}
                            onDelete={(note) => setDeletingNote(note)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <FileText size={20} />
                    </div>
                    <p className="text-slate-600 font-medium mb-1">No notes yet</p>
                    <p className="text-sm text-slate-500 mb-4">
                        Add notes to track your progress and important details.
                    </p>
                </div>
            )}

            {/* Add Note Modal (full form) */}
            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Note"
            >
                <NoteForm
                    applicationId={applicationId}
                    onSuccess={() => {
                        setIsAddOpen(false)
                        success('Note added')
                        queryClient.invalidateQueries(['notes', applicationId])
                        queryClient.invalidateQueries(['application', applicationId])
                    }}
                    onCancel={() => setIsAddOpen(false)}
                />
            </Modal>

            {/* Edit Note Modal */}
            <Modal
                isOpen={!!editingNote}
                onClose={() => setEditingNote(null)}
                title="Edit Note"
            >
                {editingNote && (
                    <NoteForm
                        applicationId={applicationId}
                        initialData={editingNote}
                        onSuccess={() => {
                            setEditingNote(null)
                            success('Note updated')
                            queryClient.invalidateQueries(['notes', applicationId])
                            queryClient.invalidateQueries(['application', applicationId])
                        }}
                        onCancel={() => setEditingNote(null)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingNote}
                onClose={() => setDeletingNote(null)}
                onConfirm={() => deleteMutation.mutate(deletingNote?.id)}
                isLoading={deleteMutation.isPending}
                title="Delete Note"
                description="Are you sure you want to delete this note? This action cannot be undone."
                confirmLabel="Delete Note"
                isDestructive={true}
            />
        </Card>
    )
}

export default NotesTimeline
