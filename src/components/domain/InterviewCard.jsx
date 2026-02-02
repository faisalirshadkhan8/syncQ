import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import {
    Calendar, Clock, Video, MapPin, CheckCircle,
    XCircle, HelpCircle, User, Briefcase, ExternalLink
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const outcomeColors = {
    pending: 'bg-slate-700/50 text-slate-400 border-slate-700/50',
    passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    no_show: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const typeIcons = {
    phone: <Briefcase size={14} />,
    technical: <User size={14} />, // or Code icon if available
    behavioral: <User size={14} />,
    onsite: <MapPin size={14} />,
    default: <Calendar size={14} />,
};

const InterviewCard = ({ interview, onClick, condensed = false }) => {
    const {
        scheduled_at,
        company_name,
        job_title,
        interview_type,
        round_number,
        duration_minutes,
        meeting_link,
        outcome,
        interviewer_names
    } = interview;

    const date = new Date(scheduled_at);
    const isUpcoming = !isPast(date) || isToday(date);

    return (
        <Card
            className="group relative cursor-pointer border border-white/5 hover:border-indigo-500/30 transition-colors"
            onClick={onClick}
            hoverEffect={true}
        >
            <div className="flex justify-between items-start gap-4">
                {/* Checkbox or Status Indicator */}
                <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${isUpcoming
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                    }`}>
                    <span className="text-xs font-bold uppercase">{format(date, 'MMM')}</span>
                    <span className="text-lg font-bold">{format(date, 'd')}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-white truncate max-w-[200px]">
                                {company_name}
                            </h4>
                            <p className="text-sm text-slate-400 truncate">{job_title}</p>
                        </div>
                        {outcome !== 'pending' && (
                            <Badge className={`text-xs px-2 py-0.5 ${outcomeColors[outcome]}`}>
                                {outcome}
                            </Badge>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-400" />
                            <span>{format(date, 'h:mm a')} ({duration_minutes}m)</span>
                        </div>

                        <div className="flex items-center gap-1.5 capitalize">
                            {typeIcons[interview_type] || typeIcons.default}
                            <span>{interview_type.replace('_', ' ')} (Round {round_number})</span>
                        </div>

                        {meeting_link && (
                            <a
                                href={meeting_link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Video size={14} />
                                <span>Join</span>
                            </a>
                        )}
                    </div>

                    {interviewer_names && !condensed && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                            <User size={12} />
                            <span>Interviewers: {interviewer_names}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default InterviewCard;
