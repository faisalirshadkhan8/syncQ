import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { companyService, COMPANY_SIZES } from '@/services/companyService'
import {
    Building2, Plus, Search, MapPin, Users, Star, ExternalLink,
    Filter, ArrowUpDown, Briefcase, MoreHorizontal, Edit2, Trash2
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import CompanyForm from './CompanyForm'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

const CompanyList = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { success, error: showError } = useToast()

    // State for filters & modals
    const [searchQuery, setSearchQuery] = useState('')
    const [sizeFilter, setSizeFilter] = useState('')
    const [sortBy, setSortBy] = useState('-created_at')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)
    const [deletingCompany, setDeletingCompany] = useState(null)

    // Fetch companies with filters
    const { data, isLoading } = useQuery({
        queryKey: ['companies', { search: searchQuery, size: sizeFilter, ordering: sortBy }],
        queryFn: () => companyService.getCompanies({
            search: searchQuery || undefined,
            size: sizeFilter || undefined,
            ordering: sortBy
        }),
        keepPreviousData: true
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (companyId) => companyService.deleteCompany(companyId),
        onSuccess: () => {
            success('Company deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            setDeletingCompany(null)
        },
        onError: () => {
            showError('Failed to delete company')
        }
    })

    const companies = data?.results || []
    const totalCount = data?.count || 0

    // Sort options
    const sortOptions = [
        { value: '-created_at', label: 'Newest First' },
        { value: 'created_at', label: 'Oldest First' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: '-name', label: 'Name (Z-A)' },
        { value: '-glassdoor_rating', label: 'Highest Rated' },
        { value: '-application_count', label: 'Most Applications' }
    ]

    // Get size label
    const getSizeLabel = (size) => {
        const sizeObj = COMPANY_SIZES.find(s => s.value === size)
        return sizeObj?.label || size || 'Unknown'
    }

    // Get size badge color
    const getSizeBadgeColor = (size) => {
        const colors = {
            startup: 'bg-violet-50 text-violet-700 border-violet-200',
            small: 'bg-blue-50 text-blue-700 border-blue-200',
            medium: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            large: 'bg-amber-50 text-amber-700 border-amber-200',
            enterprise: 'bg-rose-50 text-rose-700 border-rose-200'
        }
        return colors[size] || 'bg-slate-50 text-slate-600 border-slate-200'
    }

    if (isLoading) return <CompanyListSkeleton />

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
                        <p className="text-slate-500 mt-1">
                            {totalCount} {totalCount === 1 ? 'company' : 'companies'} in your network
                        </p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} startIcon={<Plus size={18} />}>
                        Add Company
                    </Button>
                </div>

                {/* Filters Bar */}
                <Card className="p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Size Filter */}
                        <div className="w-full md:w-48">
                            <Select
                                value={sizeFilter}
                                onChange={(e) => setSizeFilter(e.target.value)}
                                options={[
                                    { value: '', label: 'All Sizes' },
                                    ...COMPANY_SIZES.filter(s => s.value)
                                ]}
                            />
                        </div>

                        {/* Sort */}
                        <div className="w-full md:w-48">
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                options={sortOptions}
                            />
                        </div>
                    </div>
                </Card>

                {/* Companies Grid */}
                {companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {companies.map(company => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                getSizeLabel={getSizeLabel}
                                getSizeBadgeColor={getSizeBadgeColor}
                                onEdit={() => setEditingCompany(company)}
                                onDelete={() => setDeletingCompany(company)}
                                onClick={() => navigate(`/companies/${company.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Building2}
                        title="No companies found"
                        description={searchQuery || sizeFilter
                            ? "Try adjusting your filters or search query."
                            : "Start by adding companies you're interested in working for."
                        }
                        action={
                            !searchQuery && !sizeFilter && (
                                <Button onClick={() => setIsAddOpen(true)}>
                                    Add Your First Company
                                </Button>
                            )
                        }
                    />
                )}

                {/* Add Company Modal */}
                <Modal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    title="Add Company"
                    size="lg"
                >
                    <CompanyForm
                        onSuccess={() => {
                            setIsAddOpen(false)
                            success('Company added successfully')
                            queryClient.invalidateQueries(['companies'])
                        }}
                    />
                </Modal>

                {/* Edit Company Modal */}
                <Modal
                    isOpen={!!editingCompany}
                    onClose={() => setEditingCompany(null)}
                    title="Edit Company"
                    size="lg"
                >
                    {editingCompany && (
                        <CompanyForm
                            initialData={editingCompany}
                            onSuccess={() => {
                                setEditingCompany(null)
                                success('Company updated successfully')
                                queryClient.invalidateQueries(['companies'])
                            }}
                        />
                    )}
                </Modal>

                {/* Delete Confirmation */}
                <ConfirmDialog
                    isOpen={!!deletingCompany}
                    onClose={() => setDeletingCompany(null)}
                    onConfirm={() => deleteMutation.mutate(deletingCompany?.id)}
                    isLoading={deleteMutation.isPending}
                    title="Delete Company"
                    description={`Are you sure you want to delete "${deletingCompany?.name}"? This will not delete associated applications.`}
                    confirmLabel="Delete Company"
                    isDestructive={true}
                />
            </div>
        </div>
    )
}

// Company Card Component
const CompanyCard = ({ company, getSizeLabel, getSizeBadgeColor, onEdit, onDelete, onClick }) => {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <Card 
            hover 
            className="relative group cursor-pointer"
            onClick={onClick}
        >
            {/* Action Menu */}
            <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowMenu(!showMenu)
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    
                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowMenu(false)
                                }}
                            />
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowMenu(false)
                                        onEdit()
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowMenu(false)
                                        onDelete()
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Company Info */}
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 group-hover:from-teal-brand-50 group-hover:to-teal-brand-50/50 group-hover:text-teal-brand-600 group-hover:border-teal-brand-200 transition-colors">
                    <Building2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-teal-brand-700 transition-colors">
                        {company.name}
                    </h3>
                    {company.industry && (
                        <p className="text-sm text-slate-500 truncate">{company.industry}</p>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">
                {company.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{company.location}</span>
                    </div>
                )}

                {company.size && (
                    <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-slate-400" />
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium border",
                            getSizeBadgeColor(company.size)
                        )}>
                            {getSizeLabel(company.size)}
                        </span>
                    </div>
                )}

                {company.glassdoor_rating && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span>{company.glassdoor_rating} rating</span>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <Briefcase size={14} className="text-slate-400" />
                    <span className="text-slate-600 font-medium">
                        {company.application_count || 0} application{company.application_count !== 1 ? 's' : ''}
                    </span>
                </div>
                
                {company.website && (
                    <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-brand-600 transition-colors"
                    >
                        <ExternalLink size={16} />
                    </a>
                )}
            </div>
        </Card>
    )
}

// Loading Skeleton
const CompanyListSkeleton = () => (
    <div className="min-h-screen bg-slate-50/50">
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="w-48 h-10 mb-2" />
                    <Skeleton className="w-32 h-5" />
                </div>
                <Skeleton className="w-36 h-10 rounded-lg" />
            </div>

            <Skeleton className="w-full h-16 rounded-xl mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
            </div>
        </div>
    </div>
)

export default CompanyList
