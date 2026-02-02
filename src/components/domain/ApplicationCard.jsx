import React from 'react'
import { Calendar, Building, MapPin, DollarSign, ExternalLink } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { format } from 'date-fns'

const statusColors = {
    wishlist: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    screening: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    interviewing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    offer: 'bg-green-500/10 text-green-400 border-green-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    withdrawn: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    ghosted: 'bg-slate-700/10 text-slate-500 border-slate-700/20',
}

const ApplicationCard = ({ application, onClick }) => {
    const {
        company_name,
        job_title,
        status,
        location,
        applied_date,
        salary_min,
        salary_max,
        work_type,
        job_url,
    } = application

    // Format salary
    const formatSalary = (min, max) => {
        if (!min && !max) return null
        if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
        return `$${((min || max) / 1000).toFixed(0)}k`
    }

    const salary = formatSalary(salary_min, salary_max)

    return (
        <Card
            onClick={onClick}
            hoverEffect={true}
            className="cursor-pointer relative group border border-white/5 hover:border-white/10"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {job_title}
                    </h3>
                    <div className="flex items-center text-[var(--text-muted)] text-sm mt-1">
                        <Building className="w-4 h-4 mr-1.5" />
                        {company_name}
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.applied} uppercase tracking-wide`}>
                    {status}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-[var(--text-dim)]">
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 opacity-70" />
                    {location || 'Remote'} ({work_type})
                </div>
                {salary && (
                    <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 opacity-70" />
                        {salary}
                    </div>
                )}
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 opacity-70" />
                    Applied: {applied_date ? format(new Date(applied_date), 'MMM d, yyyy') : 'N/A'}
                </div>
            </div>

            {job_url && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <a
                        href={job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--text-muted)] hover:text-white flex items-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Job <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
            )}
        </Card>
    )
}

export default ApplicationCard
