import React from 'react'
import { format } from 'date-fns'
import { FileText, RefreshCw, MessageSquare, Search, CheckSquare, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { NOTE_TYPES, getNoteTypeConfig } from '@/services/noteService'

// Icon mapping
const ICON_MAP = {
    FileText: FileText,
    RefreshCw: RefreshCw,
    MessageSquare: MessageSquare,
    Search: Search,
    CheckSquare: CheckSquare
}

// Color mapping for note types
const COLOR_MAP = {
    slate: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-600',
        dot: 'bg-slate-400'
    },
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        dot: 'bg-blue-500'
    },
    purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        dot: 'bg-purple-500'
    },
    amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-600',
        dot: 'bg-amber-500'
    },
    emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        dot: 'bg-emerald-500'
    }
}

/**
 * NoteCard - Displays a single note with timeline styling
 */
const NoteCard = ({ 
    note, 
    onEdit, 
    onDelete,
    showActions = true,
    isLast = false 
}) => {
    const [showMenu, setShowMenu] = React.useState(false)
    const config = getNoteTypeConfig(note.note_type)
    const colors = COLOR_MAP[config.color] || COLOR_MAP.slate
    const Icon = ICON_MAP[config.icon] || FileText

    return (
        <div className="relative group">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200" />
            )}

            <div className="relative flex gap-4">
                {/* Timeline Dot & Icon */}
                <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    colors.bg,
                    "border",
                    colors.border
                )}>
                    <Icon size={14} className={colors.text} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                                colors.bg,
                                colors.text
                            )}>
                                {config.label}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                                {format(new Date(note.created_at), 'MMM d, yyyy • h:mm a')}
                            </span>
                        </div>

                        {/* Actions Menu */}
                        {showActions && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <MoreHorizontal size={16} />
                                </button>

                                {showMenu && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setShowMenu(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false)
                                                    onEdit?.(note)
                                                }}
                                                className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false)
                                                    onDelete?.(note)
                                                }}
                                                className="w-full px-3 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Note Content */}
                    <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {note.content}
                    </div>

                    {/* Updated indicator */}
                    {note.updated_at !== note.created_at && (
                        <p className="text-xs text-slate-400 mt-2 italic">
                            edited {format(new Date(note.updated_at), 'MMM d, h:mm a')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NoteCard
