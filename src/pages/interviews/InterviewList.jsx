import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { Plus, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InterviewCard from '@/components/domain/InterviewCard';
import InterviewForm from '@/components/domain/InterviewForm';
import { useToast } from '@/hooks/useToast';
import { isPast, isToday } from 'date-fns';

const InterviewList = () => {
    const { success, error: showError } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Edit/Delete State
    const [viewMode, setViewMode] = useState('upcoming'); // upcoming | past
    const [editingInterview, setEditingInterview] = useState(null);
    const [deletingInterview, setDeletingInterview] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['interviews'],
        queryFn: () => interviewService.getInterviews({ page_size: 100 }), // Fetch all for clientside sort for MVP
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => interviewService.deleteInterview(id),
        onSuccess: () => {
            success('Interview deleted');
            queryClient.invalidateQueries(['interviews']);
            setDeletingInterview(null);
        },
        onError: () => showError('Failed to delete interview')
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading interviews...</div>;

    const allInterviews = data?.results || [];

    // Sort logic
    const safeDate = (d) => new Date(d).getTime();

    const upcomingInterviews = allInterviews
        .filter(i => !isPast(new Date(i.scheduled_at)) || isToday(new Date(i.scheduled_at)))
        .sort((a, b) => safeDate(a.scheduled_at) - safeDate(b.scheduled_at));

    const pastInterviews = allInterviews
        .filter(i => isPast(new Date(i.scheduled_at)) && !isToday(new Date(i.scheduled_at)))
        .sort((a, b) => safeDate(b.scheduled_at) - safeDate(a.scheduled_at)); // Descending for past

    const displayedInterviews = viewMode === 'upcoming' ? upcomingInterviews : pastInterviews;

    return (
        <div className="container py-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Interviews</h1>
                    <p className="text-slate-600 font-medium mt-1">Track your schedules and prepare for success</p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(true)}
                    startIcon={<Plus size={18} />}
                    className="shadow-glow-indigo"
                >
                    Schedule Interview
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-800">
                <button
                    onClick={() => setViewMode('upcoming')}
                    className={`pb-3 px-1 text-sm font-bold transition-colors relative ${viewMode === 'upcoming' ? 'text-teal-brand-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    Upcoming ({upcomingInterviews.length})
                    {viewMode === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-brand-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setViewMode('past')}
                    className={`pb-3 px-1 text-sm font-bold transition-colors relative ${viewMode === 'past' ? 'text-teal-brand-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    Past ({pastInterviews.length})
                    {viewMode === 'past' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full" />}
                </button>
            </div>

            {displayedInterviews.length === 0 ? (
                <EmptyState
                    icon={Calendar}
                    title={`No ${viewMode} interviews`}
                    description={viewMode === 'upcoming' ? "You have no scheduled interviews. Great time to apply for more jobs!" : "No interview history found."}
                    actionLabel={viewMode === 'upcoming' ? "Schedule Interview" : undefined}
                    onAction={viewMode === 'upcoming' ? () => setIsAddOpen(true) : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedInterviews.map((interview) => (
                        <InterviewCard
                            key={interview.id}
                            interview={interview}
                            onClick={() => setEditingInterview(interview)} // Simple way to view/edit
                        />
                    ))}
                </div>
            )}

            {/* ADD Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Interview">
                <InterviewForm onSuccess={() => {
                    setIsAddOpen(false);
                    success('Interview scheduled successfully');
                }} />
            </Modal>

            {/* EDIT Modal */}
            <Modal isOpen={!!editingInterview} onClose={() => setEditingInterview(null)} title="Edit Interview">
                {editingInterview && (
                    <div className="space-y-4">
                        <InterviewForm
                            initialData={editingInterview}
                            onSuccess={() => {
                                setEditingInterview(null);
                                success('Interview updated');
                            }}
                        />
                        <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                            <p className="text-xs text-slate-500">Need to cancel?</p>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    setDeletingInterview(editingInterview);
                                    setEditingInterview(null);
                                }}
                            >
                                Delete Interview
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* DELETE Dialog */}
            <ConfirmDialog
                isOpen={!!deletingInterview}
                onClose={() => setDeletingInterview(null)}
                onConfirm={() => deleteMutation.mutate(deletingInterview.id)}
                isLoading={deleteMutation.isPending}
                title="Delete Interview"
                description="Are you sure? This will remove the interview from your schedule."
                isDestructive={true}
                confirmLabel="Delete"
            />
        </div>
    );
};

export default InterviewList;
