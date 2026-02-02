import React from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '@/stores/useAuthStore'
import { analyticsService } from '@/services/analyticsService'
import { applicationService } from '@/services/applicationService'
import { interviewService } from '@/services/interviewService'
import { Link } from 'react-router-dom'
import {
    Briefcase, Calendar, Trophy, ArrowRight, Clock, Building,
    TrendingUp, Target, Zap, BarChart3, PieChart, Activity
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import { format, isFuture, parseISO } from 'date-fns'

// Chart color palette - matches our teal theme
const CHART_COLORS = {
    primary: '#005149',
    secondary: '#008577',
    tertiary: '#00A090',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    muted: '#94a3b8'
}

const STATUS_COLORS = {
    wishlist: '#94a3b8',
    applied: '#3b82f6',
    screening: '#8b5cf6',
    interviewing: '#f59e0b',
    offer: '#10b981',
    accepted: '#059669',
    rejected: '#f43f5e',
    withdrawn: '#6b7280',
    ghosted: '#d1d5db'
}

const Dashboard = () => {
    const user = useAuthStore((state) => state.user)

    // Fetch Analytics Data from Backend
    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: analyticsService.getDashboard,
        staleTime: 1000 * 60 * 5,
        retry: 1
    })

    const { data: funnelData } = useQuery({
        queryKey: ['analytics', 'funnel'],
        queryFn: analyticsService.getFunnel,
        staleTime: 1000 * 60 * 5
    })

    const { data: weeklyData } = useQuery({
        queryKey: ['analytics', 'weekly'],
        queryFn: () => analyticsService.getWeeklyActivity({ weeks: 8 }),
        staleTime: 1000 * 60 * 5
    })

    const { data: responseRateData } = useQuery({
        queryKey: ['analytics', 'response-rate'],
        queryFn: analyticsService.getResponseRate,
        staleTime: 1000 * 60 * 5
    })

    const { data: topCompaniesData } = useQuery({
        queryKey: ['analytics', 'top-companies'],
        queryFn: () => analyticsService.getTopCompanies({ limit: 5 }),
        staleTime: 1000 * 60 * 5
    })

    // Fetch recent applications & interviews for quick lists
    const { data: appData, isLoading: appsLoading } = useQuery({
        queryKey: ['applications', 'dashboard'],
        queryFn: () => applicationService.getApplications({ page_size: 5, ordering: '-created_at' }),
    })

    const { data: interviewData, isLoading: interviewsLoading } = useQuery({
        queryKey: ['interviews', 'dashboard'],
        queryFn: () => interviewService.getInterviews({ page_size: 5, ordering: 'scheduled_at' }),
    })

    const applications = appData?.results || []
    const interviews = interviewData?.results || []

    // Process data for charts
    const upcomingInterviews = interviews
        .filter(i => isFuture(new Date(i.scheduled_at)))
        .slice(0, 3)

    const recentApps = applications.slice(0, 3)

    // Format weekly data for chart
    const weeklyChartData = weeklyData?.weekly_applications?.map(item => ({
        week: format(parseISO(item.week), 'MMM d'),
        applications: item.count
    })) || []

    // Format funnel data for chart
    const funnelChartData = funnelData?.funnel?.map((item, index) => ({
        name: item.stage.charAt(0).toUpperCase() + item.stage.slice(1),
        value: item.count,
        percentage: item.percentage,
        fill: Object.values(STATUS_COLORS)[index] || CHART_COLORS.muted
    })) || []

    // Format response rate data for pie chart
    const responseChartData = responseRateData?.by_source?.map(item => ({
        name: item.source.charAt(0).toUpperCase() + item.source.slice(1).replace('_', ' '),
        value: item.total,
        responseRate: item.response_rate
    })) || []

    // Status breakdown for pie chart
    const statusBreakdown = dashboardStats?.status_breakdown || {}
    const statusChartData = Object.entries(statusBreakdown)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            fill: STATUS_COLORS[status] || CHART_COLORS.muted
        }))

    const isLoading = statsLoading || appsLoading || interviewsLoading

    if (isLoading) return <DashboardSkeleton />

    const stats = dashboardStats || {
        total_applications: appData?.count || 0,
        active_applications: applications.filter(app => 
            ['applied', 'screening', 'interviewing', 'offer'].includes(app.status)
        ).length,
        offers_received: applications.filter(app => 
            app.status === 'offer' || app.status === 'accepted'
        ).length,
        interviews_scheduled: upcomingInterviews.length,
        response_rate: 0,
        avg_response_days: 0
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, {user?.first_name || user?.username}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Here's an overview of your job search progress.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard
                        title="Total Applications"
                        value={stats.total_applications}
                        icon={Briefcase}
                        color="text-teal-brand-700"
                        bg="bg-teal-brand-50"
                        trend={stats.total_applications > 0 ? '+12%' : null}
                        trendUp={true}
                    />
                    <StatCard
                        title="Active Pipeline"
                        value={stats.active_applications}
                        subtitle={`${Math.round((stats.active_applications / Math.max(stats.total_applications, 1)) * 100)}% of total`}
                        icon={Target}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatCard
                        title="Interviews"
                        value={stats.interviews_scheduled}
                        subtitle="Upcoming"
                        icon={Calendar}
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                    <StatCard
                        title="Offers"
                        value={stats.offers_received}
                        icon={Trophy}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        highlight={stats.offers_received > 0}
                    />
                </div>

                {/* Response Rate & Avg Days Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <Card className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Response Rate</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {stats.response_rate?.toFixed(1) || 0}%
                            </p>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Avg. Response Time</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {stats.avg_response_days?.toFixed(1) || '—'} days
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Weekly Activity Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Weekly Activity</h3>
                                <p className="text-sm text-slate-500">Applications over the last 8 weeks</p>
                            </div>
                            <div className="p-2 rounded-lg bg-teal-brand-50 text-teal-brand-600">
                                <BarChart3 size={20} />
                            </div>
                        </div>
                        <div className="h-64">
                            {weeklyChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyChartData}>
                                        <defs>
                                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="week" 
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                        />
                                        <YAxis 
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="applications" 
                                            stroke={CHART_COLORS.primary}
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorApps)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No activity data yet" />
                            )}
                        </div>
                    </Card>

                    {/* Status Distribution Chart */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Application Status</h3>
                                <p className="text-sm text-slate-500">Distribution by current stage</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                <PieChart size={20} />
                            </div>
                        </div>
                        <div className="h-64">
                            {statusChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={statusChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend 
                                            layout="vertical" 
                                            align="right" 
                                            verticalAlign="middle"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '12px' }}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyChartState message="No applications yet" />
                            )}
                        </div>
                    </Card>
                </div>

                {/* Response Rate by Source */}
                {responseChartData.length > 0 && (
                    <Card className="p-6 mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Response Rate by Source</h3>
                                <p className="text-sm text-slate-500">Which channels work best for you</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={responseChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis 
                                        type="number"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        tickFormatter={(value) => `${value}%`}
                                        domain={[0, 100]}
                                    />
                                    <YAxis 
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        width={100}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'responseRate') return [`${value.toFixed(1)}%`, 'Response Rate']
                                            return [value, name]
                                        }}
                                    />
                                    <Bar 
                                        dataKey="responseRate" 
                                        fill={CHART_COLORS.primary}
                                        radius={[0, 4, 4, 0]}
                                        maxBarSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}

                {/* Application Funnel */}
                {funnelChartData.length > 0 && (
                    <Card className="p-6 mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Application Funnel</h3>
                                <p className="text-sm text-slate-500">Your progression through stages</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {funnelChartData.map((stage) => (
                                <div 
                                    key={stage.name}
                                    className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100"
                                >
                                    <div 
                                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: stage.fill }}
                                    >
                                        {stage.value}
                                    </div>
                                    <p className="font-medium text-slate-900 text-sm">{stage.name}</p>
                                    <p className="text-xs text-slate-500">{stage.percentage.toFixed(0)}%</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Recent Activity & Upcoming */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Applications */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
                            <Link 
                                to="/applications" 
                                className="text-sm font-semibold text-teal-brand-600 hover:text-teal-brand-700 flex items-center transition-colors"
                            >
                                View All <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recentApps.length > 0 ? (
                                recentApps.map(app => (
                                    <Link key={app.id} to={`/applications/${app.id}`}>
                                        <Card hover className="p-4 flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-teal-brand-600 group-hover:bg-teal-brand-50 transition-colors">
                                                    <Building size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-teal-brand-700 transition-colors">
                                                        {app.company_name}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{app.job_title}</div>
                                                </div>
                                            </div>
                                            <Badge variant={app.status} className="text-xs" />
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <EmptyListState 
                                    icon={Briefcase}
                                    title="No applications yet"
                                    description="Start tracking your job search journey."
                                    linkTo="/applications"
                                    linkText="Add your first job"
                                />
                            )}
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Next Interviews</h2>
                            <Link 
                                to="/interviews" 
                                className="text-sm font-semibold text-teal-brand-600 hover:text-teal-brand-700 flex items-center transition-colors"
                            >
                                View Calendar <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            {upcomingInterviews.length > 0 ? (
                                upcomingInterviews.map(interview => (
                                    <Link key={interview.id} to="/interviews">
                                        <Card hover className="p-4 flex gap-5 items-center">
                                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-teal-brand-50 rounded-xl border border-teal-brand-100 text-teal-brand-700 shrink-0">
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    {format(new Date(interview.scheduled_at), 'MMM')}
                                                </span>
                                                <span className="text-xl font-bold leading-none">
                                                    {format(new Date(interview.scheduled_at), 'd')}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg">
                                                    {interview.company_name}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="capitalize font-medium">
                                                        {interview.interview_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} /> 
                                                        {format(new Date(interview.scheduled_at), 'h:mm a')}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <EmptyListState 
                                    icon={Calendar}
                                    title="No upcoming interviews"
                                    description="When you schedule an interview, it will appear here."
                                    linkTo="/interviews"
                                    linkText="Schedule Interview"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Companies */}
                {topCompaniesData?.top_companies?.length > 0 && (
                    <Card className="p-6 mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Top Companies</h3>
                                <p className="text-sm text-slate-500">Companies you've applied to most</p>
                            </div>
                            <Link 
                                to="/companies" 
                                className="text-sm font-semibold text-teal-brand-600 hover:text-teal-brand-700"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {topCompaniesData.top_companies.map((company) => (
                                <div 
                                    key={company.company__id}
                                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center hover:border-teal-brand-200 hover:bg-teal-brand-50/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-600">
                                        <Building size={18} />
                                    </div>
                                    <p className="font-semibold text-slate-900 text-sm truncate">
                                        {company.company__name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {company.application_count} apps • {company.interview_count} interviews
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

// Stat Card Component
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, subtitle, total, icon: Icon, color, bg, trend, trendUp, highlight }) => (
    <Card className={`relative overflow-hidden ${highlight ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-40 ${bg}`} />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            {total !== undefined && (
                <p className="text-xs text-slate-400 mt-0.5">of {total} total</p>
            )}
        </div>
    </Card>
)

// Empty State Components
const EmptyChartState = ({ message }) => (
    <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <BarChart3 size={40} className="mb-3 opacity-50" />
        <p className="text-sm">{message}</p>
    </div>
)

// eslint-disable-next-line no-unused-vars
const EmptyListState = ({ icon: Icon, title, description, linkTo, linkText }) => (
    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 hover:border-teal-brand-200 transition-colors group">
        <div className="w-14 h-14 bg-slate-50 group-hover:bg-teal-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-teal-brand-500 transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="text-slate-900 font-bold mb-1">{title}</h3>
        <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">{description}</p>
        <Link 
            to={linkTo} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-brand-900 text-white rounded-full font-semibold text-sm hover:bg-teal-brand-800 transition-colors shadow-lg shadow-teal-brand-900/20"
        >
            {linkText}
        </Link>
    </div>
)

// Loading Skeleton
const DashboardSkeleton = () => (
    <div className="min-h-screen bg-slate-50/50">
        <div className="container py-8">
            <Skeleton className="w-64 h-10 mb-2" />
            <Skeleton className="w-96 h-5 mb-8" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <Skeleton className="h-80 w-full rounded-xl" />
                <Skeleton className="h-80 w-full rounded-xl" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Skeleton className="w-48 h-8" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="w-48 h-8" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    </div>
)

export default Dashboard
