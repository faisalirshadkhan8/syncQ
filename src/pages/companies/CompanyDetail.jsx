import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService, COMPANY_SIZES } from '@/services/companyService'
import { applicationService } from '@/services/applicationService'
import {
    ArrowLeft, Building2, Globe, MapPin, Users, Star, Edit2, Trash2,
    Briefcase, Calendar, ExternalLink, FileText, Plus
} from 'lucide-react'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import CompanyForm from './CompanyForm'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const CompanyDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { success, error: showError } = useToast()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Fetch Company
    const { data: company, isLoading, isError } = useQuery({
        queryKey: ['company', id],
        queryFn: () => companyService.getCompany(id)
    })

    // Fetch Applications for this company
    const { data: applicationsData } = useQuery({
        queryKey: ['applications', 'company', id],
        queryFn: () => applicationService.getApplications({ company: id }),
        enabled: !!id
    })

    const applications = applicationsData?.results || []

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => companyService.deleteCompany(id),
        onSuccess: () => {
            success('Company deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            navigate('/companies')
        },
        onError: () => {
            showError('Failed to delete company')
        }
    })

    // Get size label
    const getSizeLabel = (size) => {
        const sizeObj = COMPANY_SIZES.find(s => s.value === size)
        return sizeObj?.label || size || 'Not specified'
    }

    if (isLoading) return <CompanyDetailSkeleton />

    if (isError || !company) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-xl font-bold text-rose-500 mb-4">Company not found</h2>
                <Button variant="ghost" onClick={() => navigate('/companies')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Companies
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-8 max-w-5xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/companies')} 
                        className="pl-0 hover:bg-transparent"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back to Companies
                    </Button>

                    <div className="flex gap-3">
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsEditOpen(true)} 
                            startIcon={<Edit2 size={16} />}
                        >
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Header Card */}
                        <Card className="p-8">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-brand-50 to-slate-50 border border-teal-brand-200 flex items-center justify-center text-teal-brand-600 shrink-0">
                                    <Building2 size={36} />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                        {company.name}
                                    </h1>
                                    {company.industry && (
                                        <p className="text-lg text-slate-500 mb-4">{company.industry}</p>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-4">
                                        {company.website && (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-teal-brand-600 hover:text-teal-brand-700 font-medium"
                                            >
                                                <Globe size={16} />
                                                Visit Website
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Details Grid */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Company Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem
                                    icon={MapPin}
                                    label="Location"
                                    value={company.location || 'Not specified'}
                                />
                                <DetailItem
                                    icon={Users}
                                    label="Company Size"
                                    value={getSizeLabel(company.size)}
                                />
                                <DetailItem
                                    icon={Star}
                                    label="Glassdoor Rating"
                                    value={company.glassdoor_rating 
                                        ? `${company.glassdoor_rating} / 5.0`
                                        : 'Not rated'
                                    }
                                    highlight={company.glassdoor_rating >= 4}
                                />
                                <DetailItem
                                    icon={Calendar}
                                    label="Added On"
                                    value={format(new Date(company.created_at), 'MMM d, yyyy')}
                                />
                            </div>
                        </Card>

                        {/* Notes */}
                        {company.notes && (
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-slate-400" />
                                    Notes
                                </h3>
                                <div className="prose prose-slate prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                                    {company.notes}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Applications */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Applications</h3>
                                <span className="text-2xl font-bold text-teal-brand-600">
                                    {applications.length}
                                </span>
                            </div>

                            {applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.slice(0, 5).map(app => (
                                        <Link
                                            key={app.id}
                                            to={`/applications/${app.id}`}
                                            className="block p-3 rounded-lg bg-slate-50 hover:bg-teal-brand-50 border border-transparent hover:border-teal-brand-200 transition-colors"
                                        >
                                            <div className="font-medium text-slate-900 text-sm truncate">
                                                {app.job_title}
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-slate-500">
                                                    {format(new Date(app.applied_date), 'MMM d, yyyy')}
                                                </span>
                                                <Badge variant={app.status} className="text-xs py-0" />
                                            </div>
                                        </Link>
                                    ))}

                                    {applications.length > 5 && (
                                        <Link
                                            to={`/applications?company=${id}`}
                                            className="block text-center text-sm text-teal-brand-600 font-medium py-2 hover:underline"
                                        >
                                            View all {applications.length} applications
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                        <Briefcase size={20} />
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3">No applications yet</p>
                                    <Link to="/applications">
                                        <Button size="sm" startIcon={<Plus size={14} />}>
                                            Add Application
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card>

                        {/* Quick Stats */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <StatRow
                                    label="Total Applications"
                                    value={applications.length}
                                />
                                <StatRow
                                    label="Active"
                                    value={applications.filter(a => 
                                        ['applied', 'screening', 'interviewing'].includes(a.status)
                                    ).length}
                                />
                                <StatRow
                                    label="Interviews"
                                    value={applications.filter(a => a.status === 'interviewing').length}
                                />
                                <StatRow
                                    label="Offers"
                                    value={applications.filter(a => 
                                        a.status === 'offer' || a.status === 'accepted'
                                    ).length}
                                    highlight
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Edit Modal */}
                <Modal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    title="Edit Company"
                    size="lg"
                >
                    <CompanyForm
                        initialData={company}
                        onSuccess={() => {
                            setIsEditOpen(false)
                            success('Company updated successfully')
                            queryClient.invalidateQueries({ queryKey: ['company', id] })
                        }}
                    />
                </Modal>

                {/* Delete Confirmation */}
                <ConfirmDialog
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={() => deleteMutation.mutate()}
                    isLoading={deleteMutation.isPending}
                    title="Delete Company"
                    description={`Are you sure you want to delete "${company.name}"? This will not delete associated applications.`}
                    confirmLabel="Delete Company"
                    isDestructive={true}
                />
            </div>
        </div>
    )
}

// Detail Item Component
// eslint-disable-next-line no-unused-vars
const DetailItem = ({ icon: Icon, label, value, highlight }) => (
    <div className="flex items-start gap-3">
        <div className={cn(
            "p-2 rounded-lg",
            highlight ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        )}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            <p className={cn(
                "font-medium mt-0.5",
                highlight ? "text-emerald-600" : "text-slate-900"
            )}>
                {value}
            </p>
        </div>
    </div>
)

// Stat Row Component
const StatRow = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={cn(
            "font-bold",
            highlight && value > 0 ? "text-emerald-600" : "text-slate-900"
        )}>
            {value}
        </span>
    </div>
)

// Loading Skeleton
const CompanyDetailSkeleton = () => (
    <div className="min-h-screen bg-slate-50/50">
        <div className="container py-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="w-40 h-10" />
                <div className="flex gap-3">
                    <Skeleton className="w-24 h-10 rounded-lg" />
                    <Skeleton className="w-24 h-10 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    </div>
)

export default CompanyDetail
