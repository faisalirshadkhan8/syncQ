/**
 * Job Match Analyzer Page
 * AI-powered job-resume matching analysis with score visualization,
 * skill gap identification, and actionable recommendations.
 * 
 * @module pages/ai/JobMatchAnalyzer
 * @see FRONTEND_API_DOCUMENTATION.md Section 7: AI Features - Job Match
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Target, Sparkles, Check, X, Loader2, AlertTriangle,
  TrendingUp, History, ArrowLeft, ChevronRight, Star,
  Lightbulb, Award, Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import {
  analyzeJobMatch,
  toggleFavorite
} from '@/services/aiService';
import { applicationService } from '@/services/applicationService';

/**
 * Form validation schema
 */
const jobMatchSchema = z.object({
  job_description: z.string().min(100, 'Job description must be at least 100 characters'),
  resume_text: z.string().min(100, 'Resume text must be at least 100 characters'),
  application_id: z.number().optional()
});

/**
 * Circular progress indicator for match score
 */
function MatchScoreCircle({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 80) return { stroke: '#10b981', bg: 'from-emerald-500 to-green-500', text: 'text-emerald-600' };
    if (score >= 60) return { stroke: '#f59e0b', bg: 'from-amber-500 to-yellow-500', text: 'text-amber-600' };
    return { stroke: '#f43f5e', bg: 'from-rose-500 to-red-500', text: 'text-rose-600' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke={colors.stroke}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", colors.text)}>{score}%</span>
        <span className="text-sm text-slate-500 font-medium">Match Score</span>
      </div>
    </div>
  );
}

/**
 * Skill chip component
 */
function SkillChip({ skill, variant = 'match' }) {
  const variants = {
    match: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    missing: 'bg-rose-100 text-rose-700 border-rose-200'
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border",
      variants[variant]
    )}>
      {variant === 'match' ? <Check size={14} /> : <X size={14} />}
      {skill}
    </span>
  );
}

/**
 * Analysis result display
 */
function AnalysisResult({ result, onToggleFavorite, isFavorite }) {
  // Debug: Log the result structure
  console.log('AnalysisResult received:', JSON.stringify(result, null, 2));
  
  // Handle both nested and flat response structures
  // API might return { analysis: {...} } or flat { match_score, matching_skills, ... }
  const analysis = result.analysis || result;
  
  console.log('Analysis object:', JSON.stringify(analysis, null, 2));
  console.log('Raw match_score value:', analysis.match_score, 'type:', typeof analysis.match_score);
  
  // Parse match_score - handle string, number, undefined, or NaN
  let matchScore = 0;
  if (typeof analysis.match_score === 'number' && !isNaN(analysis.match_score)) {
    matchScore = analysis.match_score;
  } else if (typeof analysis.match_score === 'string') {
    // Try to extract number from string (e.g., "85%", "85", "85 percent")
    const parsed = parseInt(analysis.match_score.replace(/[^\d.-]/g, ''), 10);
    matchScore = isNaN(parsed) ? 0 : parsed;
  }
  
  console.log('Parsed matchScore:', matchScore);
  
  // Handle skills arrays - might be strings, arrays, or objects
  const parseSkillsArray = (skills) => {
    if (Array.isArray(skills)) {
      return skills.map(s => typeof s === 'string' ? s : String(s)).filter(Boolean);
    }
    if (typeof skills === 'string') {
      return skills.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };
  
  const matchingSkills = parseSkillsArray(analysis.matching_skills);
  const missingSkills = parseSkillsArray(analysis.missing_skills);
  const recommendations = parseSkillsArray(analysis.recommendations);
  
  console.log('Parsed matchingSkills:', matchingSkills);
  console.log('Parsed missingSkills:', missingSkills);
  
  const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent Match', color: 'text-emerald-600' };
    if (score >= 60) return { label: 'Good Match', color: 'text-amber-600' };
    return { label: 'Needs Improvement', color: 'text-rose-600' };
  };

  const scoreInfo = getScoreLabel(matchScore);

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <MatchScoreCircle score={matchScore} />
              <div>
                <div className={cn("text-2xl font-bold", scoreInfo.color)}>
                  {scoreInfo.label}
                </div>
                <p className="text-slate-400 mt-1">
                  Based on skills, experience, and requirements
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                  <span>Model: {result.model}</span>
                  <span>•</span>
                  <span>{result.tokens_used} tokens</span>
                </div>
              </div>
            </div>
            {result.saved_id && (
              <button
                onClick={() => onToggleFavorite?.(result.saved_id)}
                className={cn(
                  "p-3 rounded-xl transition-colors",
                  isFavorite
                    ? "text-amber-400 bg-amber-400/10"
                    : "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                )}
              >
                <Star size={24} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Matching Skills</h3>
              <p className="text-sm text-slate-500">{matchingSkills.length} skills aligned</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, i) => (
              <SkillChip key={i} skill={skill} variant="match" />
            ))}
            {matchingSkills.length === 0 && (
              <p className="text-sm text-slate-500 italic">No specific matches identified</p>
            )}
          </div>
        </Card>

        {/* Missing Skills */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Skill Gaps</h3>
              <p className="text-sm text-slate-500">{missingSkills.length} areas to develop</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, i) => (
              <SkillChip key={i} skill={skill} variant="missing" />
            ))}
            {missingSkills.length === 0 && (
              <p className="text-sm text-slate-500 italic">No significant gaps identified</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Recommendations</h3>
              <p className="text-sm text-slate-500">Steps to improve your candidacy</p>
            </div>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-teal-700">{i + 1}</span>
                </div>
                <span className="text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Summary */}
      {(analysis.summary || result.summary) && (
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
              <Award size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900">Summary</h3>
              <p className="text-teal-800 mt-2 leading-relaxed">{analysis.summary || result.summary}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Main Job Match Analyzer Page
 */
export default function JobMatchAnalyzer() {
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
    resolver: zodResolver(jobMatchSchema),
    defaultValues: {
      job_description: '',
      resume_text: '',
      application_id: applicationId ? parseInt(applicationId) : undefined
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedApplicationId = watch('application_id');

  // Auto-fill job description from selected application
  React.useEffect(() => {
    if (selectedApplicationId) {
      const app = applications.find(a => a.id === selectedApplicationId);
      if (app?.job_description) {
        setValue('job_description', app.job_description);
      }
    }
  }, [selectedApplicationId, applications, setValue]);

  // Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: analyzeJobMatch,
    onSuccess: (data) => {
      // Debug: Log the response to see the actual structure
      console.log('Job Match API Response:', JSON.stringify(data, null, 2));
      
      setResult(data);
      setIsFavorite(false);
      
      // Handle both nested and flat response structures
      const analysis = data.analysis || data;
      const score = analysis.match_score ?? 'N/A';
      
      toast({
        title: 'Analysis complete!',
        description: `Your match score: ${score}%`,
        variant: 'success'
      });
      queryClient.invalidateQueries({ queryKey: ['ai-history'] });
    },
    onError: (error) => {
      console.error('Job Match API Error:', error.response?.data || error);
      toast({
        title: 'Analysis failed',
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
    const payload = {
      ...data,
      application_id: data.application_id || undefined
    };
    analyzeMutation.mutate(payload);
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              Job Match Analyzer
            </h1>
            <p className="text-slate-500 mt-1">
              See how well your resume matches the job requirements
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

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form - 2 columns */}
        <Card className="lg:col-span-2 p-6">
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
              </div>
            )}

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('job_description')}
                placeholder="Paste the complete job description including requirements, responsibilities, and qualifications..."
                rows={10}
                error={errors.job_description?.message}
              />
            </div>

            {/* Resume Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Resume <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('resume_text')}
                placeholder="Paste your complete resume text including skills, experience, and education..."
                rows={10}
                error={errors.resume_text?.message}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Analyze Match
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Results - 3 columns */}
        <div className="lg:col-span-3">
          {analyzeMutation.isPending ? (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 animate-pulse">
                  <Target size={36} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Analyzing Your Match
                </h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  Our AI is comparing your skills and experience against the job requirements...
                </p>
                <div className="flex items-center gap-2 mt-6">
                  <Loader2 size={16} className="animate-spin text-violet-600" />
                  <span className="text-sm text-slate-500">This may take 15-45 seconds</span>
                </div>
              </div>
            </Card>
          ) : result ? (
            <AnalysisResult
              result={result}
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              isFavorite={isFavorite}
            />
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                  <Target size={36} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Ready to Analyze
                </h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  Paste your job description and resume to see your match score, skill gaps, and recommendations.
                </p>

                {/* Feature highlights */}
                <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-lg">
                  <div className="text-center p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                      <TrendingUp size={20} className="text-emerald-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Match Score</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-2">
                      <Check size={20} className="text-violet-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Skill Analysis</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-2">
                      <Lightbulb size={20} className="text-amber-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Recommendations</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
