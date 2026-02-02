import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services/applicationService';
import { interviewService } from '@/services/interviewService';
import {
    ArrowLeft, Building, MapPin, Calendar, DollarSign,
    ExternalLink, Edit2, Trash2, Clock, CheckCircle, XCircle, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import ApplicationForm from './ApplicationForm';
import InterviewCard from '@/components/domain/InterviewCard';
import InterviewForm from '@/components/domain/InterviewForm';
import NotesTimeline from '@/components/domain/NotesTimeline';
import { useToast } from '@/hooks/useToast';

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);


    // Interview Modal States
    const [isAddInterviewOpen, setIsAddInterviewOpen] = useState(false);
    const [editingInterview, setEditingInterview] = useState(null);

    // Fetch Application Data
    const { data: application, isLoading, isError } = useQuery({
        queryKey: ['application', id],
        queryFn: () => applicationService.getApplication(id),
    });

    // Fetch Linked Interviews
    const { data: interviewsData } = useQuery({
        queryKey: ['interviews', 'app', id],
        queryFn: () => interviewService.getInterviews({ application: id }),
        enabled: !!id
    });

    const interviews = interviewsData?.results || [];

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: () => applicationService.deleteApplication(id),
        onSuccess: () => {
            success('Application deleted successfully');
            queryClient.invalidateQueries(['applications']);
            navigate('/applications');
        },
        onError: () => {
            showError('Failed to delete application');
        }
    });

    if (isLoading) return <ApplicationDetailSkeleton />;

    if (isError) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-rose-500">Error loading application</h2>
            <Button variant="ghost" onClick={() => navigate('/applications')} className="mt-4">
                <ArrowLeft size={16} className="mr-2" /> Back to Applications
            </Button>
        </div>
    );

    const {
        company_name, job_title, status, location, applied_date,
        salary_min, salary_max, work_type, job_url, job_description, notes
    } = application;

    // Helper for salary formatting
    const formatSalary = (min, max) => {
        if (!min && !max) return 'Not specified';
        if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
        return `$${((min || max) / 1000).toFixed(0)}k`;
    };

    return (
        <div className="container py-8 max-w-5xl mx-auto animate-fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate('/applications')} className="pl-0 hover:bg-transparent">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </Button>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsEditOpen(true)} startIcon={<Edit2 size={16} />}>
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => setIsDeleteOpen(true)}
                        startIcon={<Trash2 size={16} />}
                        className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20"
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Core Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job_title}</h1>
                                <div className="flex items-center text-xl text-slate-500">
                                    <Building className="mr-2 text-teal-brand-600" size={24} />
                                    {company_name}
                                </div>
                            </div>
                            <Badge variant={status} className="text-sm px-3 py-1">
                                {status.replace('_', ' ')}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-slate-600">
                            <InfoItem icon={MapPin} label="Location" value={`${location || 'Remote'} (${work_type})`} />
                            <InfoItem icon={DollarSign} label="Salary" value={formatSalary(salary_min, salary_max)} />
                            <InfoItem icon={Calendar} label="Applied" value={format(new Date(applied_date), 'MMM d, yyyy')} />
                            <InfoItem
                                icon={ExternalLink}
                                label="Job Link"
                                value={job_url ? <a href={job_url} target="_blank" rel="noreferrer" className="text-teal-brand-600 hover:underline truncate block max-w-[200px]">View Posting</a> : 'N/A'}
                            />
                        </div>
                    </Card>

                    {/* Job Description */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Job Description</h3>
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                            {job_description || "No description provided."}
                        </div>
                    </Card>

                    {/* Notes Section - Uses NotesTimeline Component */}
                    <NotesTimeline 
                        applicationId={id} 
                        initialNotes={notes || []} 
                    />
                </div>

                {/* Right Column: Interviews & Actions */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Interviews</h3>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="px-2"
                                onClick={() => setIsAddInterviewOpen(true)}
                            >
                                <Plus size={16} />
                            </Button>
                        </div>

                        {interviews.length > 0 ? (
                            <div className="space-y-3">
                                {interviews.map(interview => (
                                    <InterviewCard
                                        key={interview.id}
                                        interview={interview}
                                        condensed={true}
                                        onClick={() => setEditingInterview(interview)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                                <p className="text-sm text-slate-500 mb-3">No interviews scheduled</p>
                                <Button size="sm" onClick={() => setIsAddInterviewOpen(true)}>Schedule One</Button>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Next Steps</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-teal-brand-50 border border-teal-brand-100">
                                <h4 className="font-semibold text-teal-brand-800 mb-1">Follow Up</h4>
                                <p className="text-sm text-teal-brand-600">Scheduled for Jan 28, 2026</p>
                            </div>
                            <Button className="w-full" variant="secondary">Log Activity</Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Application Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Application">
                <ApplicationForm
                    initialData={application}
                    onSuccess={() => {
                        setIsEditOpen(false);
                        success('Application updated successfully');
                        queryClient.invalidateQueries(['application', id]);
                    }}
                />
            </Modal>

            {/* Add Interview Modal */}
            <Modal isOpen={isAddInterviewOpen} onClose={() => setIsAddInterviewOpen(false)} title="Schedule Interview">
                <InterviewForm
                    preSelectedApplicationId={id}
                    onSuccess={() => {
                        setIsAddInterviewOpen(false);
                        success('Interview scheduled');
                        queryClient.invalidateQueries(['interviews', 'app', id]);
                    }}
                />
            </Modal>

            {/* Edit Interview Modal */}
            <Modal isOpen={!!editingInterview} onClose={() => setEditingInterview(null)} title="Edit Interview">
                {editingInterview && (
                    <InterviewForm
                        initialData={editingInterview}
                        preSelectedApplicationId={id}
                        onSuccess={() => {
                            setEditingInterview(null);
                            success('Interview updated');
                            queryClient.invalidateQueries(['interviews', 'app', id]);
                        }}
                    />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => deleteMutation.mutate()}
                isLoading={deleteMutation.isPending}
                title="Delete Application"
                description={`Are you sure you want to delete your application for ${job_title} at ${company_name}? This action cannot be undone.`}
                confirmLabel="Delete Application"
                isDestructive={true}
            />
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            <div className="text-slate-900 font-medium">{value}</div>
        </div>
    </div>
);

const ApplicationDetailSkeleton = () => (
    <div className="container py-8 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between">
            <Skeleton className="w-24 h-10" />
            <div className="flex gap-2">
                <Skeleton className="w-24 h-10" />
                <Skeleton className="w-24 h-10" />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        </div>
    </div>
);

export default ApplicationDetail;
