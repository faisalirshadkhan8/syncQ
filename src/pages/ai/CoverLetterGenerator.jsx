/**
 * Cover Letter Generator Page
 * AI-powered cover letter generation with tone selection, resume integration,
 * and real-time generation status tracking.
 * 
 * @module pages/ai/CoverLetterGenerator
 * @see FRONTEND_API_DOCUMENTATION.md Section 7: AI Features - Cover Letter
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, Sparkles, Copy, Download, Check, Loader2,
  ChevronDown, Building2, Briefcase, RefreshCw, History,
  Star, ArrowLeft, Wand2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import {
  generateCoverLetter,
  COVER_LETTER_TONES,
  toggleFavorite
} from '@/services/aiService';
import { applicationService } from '@/services/applicationService';

/**
 * Form validation schema
 */
const coverLetterSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_description: z.string().min(50, 'Job description must be at least 50 characters'),
  resume_text: z.string().optional(),
  tone: z.string().default('professional'),
  application_id: z.number().optional()
});

/**
 * Tone selector component
 */
function ToneSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Writing Tone
      </label>
      <div className="grid grid-cols-2 gap-3">
        {Object.values(COVER_LETTER_TONES).map((tone) => (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              value === tone.value
                ? "border-teal-brand bg-teal-50 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div className="font-medium text-slate-900">{tone.label}</div>
            <div className="text-sm text-slate-500 mt-1">{tone.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Generated cover letter display with actions
 */
function CoverLetterResult({ result, onCopy, onToggleFavorite, isFavorite }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.cover_letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Generated Cover Letter</h3>
            <p className="text-sm text-slate-500">
              Model: {result.model} • {result.tokens_used} tokens
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result.saved_id && (
            <button
              onClick={() => onToggleFavorite?.(result.saved_id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isFavorite
                  ? "text-amber-500 bg-amber-50"
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
              )}
            >
              <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none whitespace-pre-wrap">
          {result.cover_letter}
        </div>
      </div>
    </Card>
  );
}

/**
 * Main Cover Letter Generator Page
 */
export default function CoverLetterGenerator() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [result, setResult] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch applications for dropdown
  const { data: applicationsData } = useQuery({
    queryKey: ['applications', { limit: 100 }],
    queryFn: () => applicationService.getApplications({ page_size: 100 }),
    staleTime: 60000
  });

  const applications = React.useMemo(() => applicationsData?.results || [], [applicationsData]);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      job_description: '',
      resume_text: '',
      tone: 'professional',
      application_id: applicationId ? parseInt(applicationId) : undefined
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedTone = watch('tone');
  const selectedApplicationId = watch('application_id');

  // Auto-fill from selected application
  React.useEffect(() => {
    if (selectedApplicationId) {
      const app = applications.find(a => a.id === selectedApplicationId);
      if (app) {
        setValue('company_name', app.company_name || '');
        setValue('job_title', app.job_title || '');
        if (app.job_description) {
          setValue('job_description', app.job_description);
        }
      }
    }
  }, [selectedApplicationId, applications, setValue]);

  // Generation mutation
  const generateMutation = useMutation({
    mutationFn: generateCoverLetter,
    onSuccess: (data) => {
      setResult(data);
      setIsFavorite(false);
      toast({
        title: 'Cover letter generated!',
        description: 'Your AI-powered cover letter is ready.',
        variant: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error.response?.data?.error || 'Please try again',
        variant: 'error'
      });
    }
  });

  // Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (data) => {
      setIsFavorite(data.is_favorite);
      toast({
        title: data.is_favorite ? 'Added to favorites' : 'Removed from favorites',
        variant: 'success'
      });
    }
  });

  const onSubmit = (data) => {
    // Clean up empty optional fields
    const payload = {
      ...data,
      resume_text: data.resume_text || undefined,
      application_id: data.application_id || undefined
    };
    generateMutation.mutate(payload);
  };

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <Wand2 size={20} className="text-white" />
              </div>
              Cover Letter Generator
            </h1>
            <p className="text-slate-500 mt-1">
              Create compelling, personalized cover letters with AI
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/ai/history')}
        >
          <History size={16} />
          View History
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Application Selector */}
            {applications.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Link to Application <span className="text-slate-400">(optional)</span>
                </label>
                <Select
                  value={selectedApplicationId || ''}
                  onChange={(e) => setValue('application_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Select an application...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.job_title} at {app.company_name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Auto-fills company and job details
                </p>
              </div>
            )}

            {/* Company & Job Title */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('company_name')}
                  placeholder="e.g., Google"
                  error={errors.company_name?.message}
                  icon={Building2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('job_title')}
                  placeholder="e.g., Senior Software Engineer"
                  error={errors.job_title?.message}
                  icon={Briefcase}
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('job_description')}
                placeholder="Paste the full job description here..."
                rows={8}
                error={errors.job_description?.message}
              />
              <p className="text-xs text-slate-500 mt-1">
                Include key requirements and responsibilities for better results
              </p>
            </div>

            {/* Resume Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Resume/Experience <span className="text-slate-400">(optional)</span>
              </label>
              <Textarea
                {...register('resume_text')}
                placeholder="Paste your resume or key experience highlights..."
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Helps personalize the cover letter to your background
              </p>
            </div>

            {/* Tone Selector */}
            <ToneSelector
              value={selectedTone}
              onChange={(tone) => setValue('tone', tone)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Result Display */}
        <div className="space-y-6">
          {generateMutation.isPending ? (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Crafting Your Cover Letter
                </h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Our AI is analyzing the job requirements and personalizing your cover letter...
                </p>
                <div className="flex items-center gap-2 mt-6">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span className="text-sm text-slate-500">This may take 10-30 seconds</span>
                </div>
              </div>
            </Card>
          ) : result ? (
            <CoverLetterResult
              result={result}
              onCopy={() => toast({ title: 'Copied to clipboard!', variant: 'success' })}
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              isFavorite={isFavorite}
            />
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <FileText size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Your Cover Letter Will Appear Here
                </h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Fill in the job details and click generate to create a personalized cover letter.
                </p>
              </div>
            </Card>
          )}

          {/* Tips Card */}
          <Card className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
            <h4 className="font-semibold text-teal-900 flex items-center gap-2">
              <Sparkles size={16} className="text-teal-600" />
              Pro Tips for Better Results
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-teal-800">
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-teal-600 shrink-0" />
                Include the complete job description with all requirements
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-teal-600 shrink-0" />
                Add your resume text for personalized highlights
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-teal-600 shrink-0" />
                Choose a tone that matches the company culture
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 text-teal-600 shrink-0" />
                Review and personalize the generated content
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
