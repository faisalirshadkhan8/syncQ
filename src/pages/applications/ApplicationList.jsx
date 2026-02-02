
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { applicationService } from '@/services/applicationService'
import { useNavigate } from 'react-router-dom'
import ApplicationCard from '@/components/domain/ApplicationCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Plus, Search, Filter } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ApplicationForm from './ApplicationForm'
import { useToast } from '@/hooks/useToast'
import Skeleton from '@/components/ui/Skeleton'

const ApplicationList = () => {
    const navigate = useNavigate()
    const { success } = useToast()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Fetch call with params
    const { data, isLoading, error } = useQuery({
        queryKey: ['applications', search, statusFilter],
        queryFn: () => applicationService.getApplications({
            search: search || undefined,
            status: statusFilter || undefined
        }),
    })

    const applications = data?.results || []

    const handleSuccess = () => {
        setIsAddOpen(false)
        success('Application added successfully!')
    }

    return (
        <div className="container py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
                    <p className="text-slate-600 font-medium mt-1">Manage and track your job search journey</p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(true)}
                    startIcon={<Plus size={18} />}
                    className="shadow-glow-indigo"
                >
                    Add Application
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1">
                    <Input
                        placeholder="Search by company or title..."
                        leftIcon={<Search size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white border-slate-200 focus:border-teal-brand-500"
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        placeholder="Filter Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'wishlist', label: 'Wishlist' },
                            { value: 'applied', label: 'Applied' },
                            { value: 'interviewing', label: 'Interviewing' },
                            { value: 'offer', label: 'Offer' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
                        className="bg-white border-slate-200 focus:border-teal-brand-500"
                    />
                </div>
            </div>

            {/* Grid Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20 text-rose-500 bg-rose-500/5 rounded-xl border border-rose-500/20">
                    <h3 className="font-bold mb-2">Error loading applications</h3>
                    <p>Please check your connection and try again.</p>
                </div>
            ) : applications.length === 0 ? (
                <EmptyState
                    title={search || statusFilter ? "No matches found" : "No applications yet"}
                    description={search || statusFilter ? "Try adjusting your filters" : "Start tracking your job search by adding your first application."}
                    actionLabel={!search && !statusFilter && "Add Application"}
                    onAction={!search && !statusFilter ? () => setIsAddOpen(true) : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            onClick={() => navigate(`/applications/${app.id}`)}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Application"
            >
                <ApplicationForm onSuccess={handleSuccess} />
            </Modal>
        </div>
    )
}

export default ApplicationList
