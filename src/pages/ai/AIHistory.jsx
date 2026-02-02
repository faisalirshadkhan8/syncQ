/**
 * AI History Page
 * View and manage all AI-generated content including cover letters,
 * job match analyses, and interview questions with favorites and ratings.
 * 
 * @module pages/ai/AIHistory
 * @see FRONTEND_API_DOCUMENTATION.md Section 7: AI Features - History
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Target, HelpCircle, Star, Trash2, Copy, Check,
  Filter, Search, Loader2, ChevronDown, Clock, Sparkles,
  ArrowLeft, Eye, ExternalLink, Calendar
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import {
  getHistory,
  toggleFavorite,
  rateHistoryItem,
  deleteHistoryItem,
  getFavorites,
  CONTENT_TYPES
} from '@/services/aiService';

/**
 * Content type icons and colors
 */
const CONTENT_TYPE_CONFIG = {
  cover_letter: {
    icon: FileText,
    label: 'Cover Letter',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    gradient: 'from-teal-500 to-emerald-500'
  },
  job_match: {
    icon: Target,
    label: 'Job Match',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    gradient: 'from-violet-500 to-purple-500'
  },
  interview_questions: {
    icon: HelpCircle,
    label: 'Interview Questions',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    gradient: 'from-orange-500 to-amber-500'
  }
};

/**
 * Star rating component
 */
function StarRating({ rating, onRate, size = 16 }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              (hoverRating || rating) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * History item card
 */
function HistoryCard({ item, onView, onToggleFavorite, onRate, onDelete }) {
  const [copied, setCopied] = useState(false);
  const config = CONTENT_TYPE_CONFIG[item.content_type] || CONTENT_TYPE_CONFIG.cover_letter;
  const Icon = config.icon;

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.output_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
            config.gradient
          )}>
            <Icon size={22} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                  config.color
                )}>
                  {config.label}
                </span>
                <h3 className="font-semibold text-slate-900 mt-2 line-clamp-1">
                  {item.input_job_title}
                  {item.input_company_name && ` at ${item.input_company_name}`}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(item.id);
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  item.is_favorite
                    ? "text-amber-500"
                    : "text-slate-300 hover:text-amber-500 opacity-0 group-hover:opacity-100"
                )}
              >
                <Star size={18} fill={item.is_favorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Preview */}
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
              {item.output_content?.substring(0, 150)}...
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(item.created_at)}
                </span>
                <span>{item.tokens_used} tokens</span>
              </div>

              {/* Rating */}
              <StarRating
                rating={item.rating}
                onRate={(rating) => onRate?.(item.id, rating)}
                size={14}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(item)}
          >
            <Eye size={14} />
            View Full
          </Button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Detail modal for viewing full content
 */
function DetailModal({ item, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const config = CONTENT_TYPE_CONFIG[item.content_type] || CONTENT_TYPE_CONFIG.cover_letter;
  const Icon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.output_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([item.output_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.content_type}-${item.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
            config.gradient
          )}>
            <Icon size={26} className="text-white" />
          </div>
          <div>
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
              config.color
            )}>
              {config.label}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {item.input_job_title}
              {item.input_company_name && ` at ${item.input_company_name}`}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <span>Model: {item.model_used}</span>
              <span>{item.tokens_used} tokens</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 rounded-xl bg-slate-50 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
            {item.output_content}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Loading skeleton for history cards
 */
function HistorySkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-48 mt-2" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
          <div className="flex items-center justify-between mt-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Main AI History Page
 */
export default function AIHistory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Fetch history
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ai-history', filter, showFavorites],
    queryFn: () => showFavorites 
      ? getFavorites() 
      : getHistory({ content_type: filter !== 'all' ? filter : undefined }),
    retry: 1
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
    }
  });

  // Rate mutation
  const rateMutation = useMutation({
    mutationFn: ({ id, rating }) => rateHistoryItem(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast({ title: 'Rating saved', variant: 'success' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
      toast({ title: 'Item deleted', variant: 'success' });
      setDeletingItem(null);
    }
  });

  // Handle results - array or paginated object
  const items = Array.isArray(data) ? data : (data?.results || []);
  
  // Filter by search
  const filteredItems = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.input_job_title?.toLowerCase().includes(searchLower) ||
      item.input_company_name?.toLowerCase().includes(searchLower) ||
      item.output_content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
              AI History
            </h1>
            <p className="text-slate-500 mt-1">
              View and manage your AI-generated content
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company..."
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Types</option>
            <option value="cover_letter">Cover Letters</option>
            <option value="job_match">Job Match</option>
            <option value="interview_questions">Interview Questions</option>
          </Select>

          {/* Favorites Toggle */}
          <Button
            variant={showFavorites ? 'primary' : 'outline'}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star size={16} fill={showFavorites ? 'currentColor' : 'none'} />
            Favorites
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { 
            type: 'cover_letter', 
            label: 'New Cover Letter', 
            path: '/ai/cover-letter',
            config: CONTENT_TYPE_CONFIG.cover_letter
          },
          { 
            type: 'job_match', 
            label: 'Analyze Job Match', 
            path: '/ai/job-match',
            config: CONTENT_TYPE_CONFIG.job_match
          },
          { 
            type: 'interview_questions', 
            label: 'Generate Questions', 
            path: '/ai/interview-questions',
            config: CONTENT_TYPE_CONFIG.interview_questions
          }
        ].map((action) => {
          const Icon = action.config.icon;
          return (
            <button
              key={action.type}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                action.config.gradient
              )}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{action.label}</div>
                <div className="text-xs text-slate-500">Create new</div>
              </div>
              <ExternalLink size={16} className="ml-auto text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <HistorySkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-12">
          <EmptyState
            icon={Clock}
            title="Failed to load history"
            description="There was an error loading your AI history."
            action={
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            }
          />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={showFavorites ? Star : Sparkles}
            title={showFavorites ? "No favorites yet" : "No AI history"}
            description={
              showFavorites
                ? "Star your favorite generations to find them here"
                : "Generate cover letters, analyze job matches, or create interview questions to see them here."
            }
            action={
              <Button onClick={() => navigate('/ai/cover-letter')}>
                <Sparkles size={16} />
                Generate Something
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</span>
            <span className="text-slate-300">•</span>
            <span>{filteredItems.filter(i => i.is_favorite).length} favorited</span>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onView={() => setSelectedItem(item)}
                onToggleFavorite={(id) => favoriteMutation.mutate(id)}
                onRate={(id, rating) => rateMutation.mutate({ id, rating })}
                onDelete={() => setDeletingItem(item)}
              />
            ))}
          </div>
        </>
      )}

      {/* Detail Modal */}
      <DetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deleteMutation.mutate(deletingItem?.id)}
        title="Delete AI Generation"
        message={`Are you sure you want to delete this ${CONTENT_TYPE_CONFIG[deletingItem?.content_type]?.label || 'item'}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
