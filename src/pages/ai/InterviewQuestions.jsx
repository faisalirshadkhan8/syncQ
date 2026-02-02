/**
 * Interview Questions Generator Page
 * AI-powered interview questions generation based on job description,
 * with categorization and practice mode features.
 * 
 * @module pages/ai/InterviewQuestions
 * @see FRONTEND_API_DOCUMENTATION.md Section 7: AI Features - Interview Questions
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HelpCircle, Sparkles, Copy, Download, Check, Loader2,
  Building2, Briefcase, History, ArrowLeft, MessageSquare,
  Star, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import {
  generateInterviewQuestions,
  toggleFavorite
} from '@/services/aiService';
import { applicationService } from '@/services/applicationService';

/**
 * Form validation schema
 */
const questionsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_description: z.string().min(50, 'Job description must be at least 50 characters'),
  question_count: z.number().min(5).max(20).default(10),
  application_id: z.number().optional()
});

/**
 * Parse markdown-like text into clean formatted segments
 * Handles **bold**, *italic*, and bullet points
 */
function parseFormattedText(text) {
  if (!text) return null;
  
  // Split by lines to handle bullet points
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return null;
    
    // Check if it's a bullet point
    const isBullet = /^[*\-•]\s/.test(trimmedLine);
    const cleanLine = isBullet ? trimmedLine.replace(/^[*\-•]\s/, '') : trimmedLine;
    
    // Parse inline formatting: **bold** and *italic*
    const parts = [];
    let key = 0;
    
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(cleanLine)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>{cleanLine.slice(lastIndex, match.index)}</span>
        );
      }
      
      // Add the formatted text
      if (match[2]) {
        // Bold text (**text**)
        parts.push(
          <strong key={key++} className="font-semibold text-slate-900">{match[2]}</strong>
        );
      } else if (match[3]) {
        // Italic text (*text*)
        parts.push(
          <em key={key++} className="text-slate-600">{match[3]}</em>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < cleanLine.length) {
      parts.push(<span key={key++}>{cleanLine.slice(lastIndex)}</span>);
    }
    
    // If no formatting was found, just use the clean line
    const content = parts.length > 0 ? parts : cleanLine;
    
    if (isBullet) {
      return (
        <li key={lineIndex} className="flex items-start gap-2 text-slate-700">
          <span className="text-teal-500 mt-1">•</span>
          <span>{content}</span>
        </li>
      );
    }
    
    return (
      <p key={lineIndex} className="text-slate-700 leading-relaxed">
        {content}
      </p>
    );
  }).filter(Boolean);
}

/**
 * Formatted text display component
 */
function FormattedText({ text, className }) {
  const parsed = parseFormattedText(text);
  
  // Check if content has bullet points
  const hasBullets = text?.includes('\n*') || text?.includes('\n-') || text?.includes('\n•');
  
  if (hasBullets) {
    return (
      <ul className={cn("space-y-1.5", className)}>
        {parsed}
      </ul>
    );
  }
  
  return <div className={cn("space-y-2", className)}>{parsed}</div>;
}

/**
 * Single question card with expand/collapse
 */
function QuestionCard({ question, index, isPracticeMode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Parse question - extract question text and additional content (category, tips, answer)
  // Handle multiple content formats from AI
  const lines = question.split('\n').filter(l => l.trim());
  
  // Extract the main question (usually first non-empty line, may have ** around it)
  let questionText = lines[0]?.replace(/^\*\*|\*\*$/g, '').trim() || question;
  
  // Find category, why this might be asked, tips, etc.
  const metadata = {
    category: null,
    whyAsked: null,
    tips: null,
    answerHint: null
  };
  
  let currentSection = null;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (/^\*?\s*Category:?\s*\*?/i.test(line)) {
      metadata.category = line.replace(/^\*?\s*Category:?\s*\*?/i, '').replace(/\*+/g, '').trim();
    } else if (/^\*?\s*Why this question/i.test(line)) {
      currentSection = 'whyAsked';
      const content = line.replace(/^\*?\s*Why this question[^:]*:?\s*\*?/i, '').trim();
      if (content) metadata.whyAsked = content;
    } else if (/^\*?\s*Tips? for answering/i.test(line)) {
      currentSection = 'tips';
      const content = line.replace(/^\*?\s*Tips? for answering:?\s*\*?/i, '').trim();
      if (content) metadata.tips = content;
    } else if (/^\*?\s*(Answer|Suggested Answer|Sample Answer):?\s*\*?/i.test(line)) {
      currentSection = 'answer';
      const content = line.replace(/^\*?\s*(Answer|Suggested Answer|Sample Answer):?\s*\*?/i, '').trim();
      if (content) metadata.answerHint = content;
    } else if (currentSection && line) {
      // Continue building current section
      if (currentSection === 'whyAsked') {
        metadata.whyAsked = (metadata.whyAsked ? metadata.whyAsked + ' ' : '') + line.replace(/\*+/g, '');
      } else if (currentSection === 'tips') {
        metadata.tips = (metadata.tips ? metadata.tips + ' ' : '') + line.replace(/\*+/g, '');
      } else if (currentSection === 'answer') {
        metadata.answerHint = (metadata.answerHint ? metadata.answerHint + ' ' : '') + line.replace(/\*+/g, '');
      }
    }
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      isExpanded && "ring-2 ring-teal-500/20"
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-medium leading-relaxed">
            {questionText}
          </p>
          {metadata.category && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
              {metadata.category}
            </span>
          )}
        </div>
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp size={20} className="text-slate-400" />
          ) : (
            <ChevronDown size={20} className="text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="pt-4 pl-12 space-y-4">
            {/* Why This Question Might Be Asked */}
            {metadata.whyAsked && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-xs font-semibold text-blue-700 mb-1">Why This Question?</div>
                <p className="text-sm text-blue-800 leading-relaxed">{metadata.whyAsked}</p>
              </div>
            )}
            
            {/* Tips for Answering */}
            {metadata.tips && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-xs font-semibold text-amber-700 mb-1">Tips for Answering</div>
                <p className="text-sm text-amber-800 leading-relaxed">{metadata.tips}</p>
              </div>
            )}
            
            {isPracticeMode ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Your Answer</span>
                  {metadata.answerHint && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAnswer(!showAnswer); }}
                      className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showAnswer ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="Practice your answer here..."
                  rows={4}
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {showAnswer && metadata.answerHint && (
                  <div className="mt-3 p-3 rounded-lg bg-teal-50 border border-teal-100">
                    <div className="text-xs font-semibold text-teal-700 mb-1">Sample Answer</div>
                    <p className="text-sm text-teal-800 leading-relaxed">{metadata.answerHint}</p>
                  </div>
                )}
              </div>
            ) : metadata.answerHint ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-1">Sample Answer</div>
                <p className="text-sm text-slate-700 leading-relaxed">{metadata.answerHint}</p>
              </div>
            ) : !metadata.whyAsked && !metadata.tips ? (
              <p className="text-sm text-slate-500 italic">
                Think about specific examples from your experience that demonstrate relevant skills.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Questions result display
 */
function QuestionsResult({ result, onCopy, onToggleFavorite, isFavorite }) {
  const [copied, setCopied] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // Parse questions from the response - handle multiple formats
  // Format 1: "1. Question text..." (numbered)
  // Format 2: "Here are X questions:\n\n1. Question..." (intro + numbered)
  // Format 3: Plain text with question marks
  const parseQuestions = (text) => {
    if (!text) return [];
    
    // Remove common intro lines
    const cleanText = text
      .replace(/^Here are \d+ likely interview questions[^:]*:\s*/i, '')
      .replace(/^Here are the interview questions[^:]*:\s*/i, '')
      .trim();
    
    // Split by numbered patterns (1., 2., etc.)
    const questions = cleanText
      .split(/\n\s*(?=\d+\.\s|\*\*\d+\.|\*\*Q\d+)/i)
      .map(q => {
        // Clean up the question text
        return q
          .replace(/^\d+\.\s*/, '')           // Remove leading number
          .replace(/^\*\*\d+\.\s*/, '')       // Remove **1. 
          .replace(/^\*\*Q\d+[:.]\s*/, '')    // Remove **Q1:
          .trim();
      })
      .filter(q => q.length > 10);
    
    return questions;
  };
  
  const questions = parseQuestions(result.questions);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.questions);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.questions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-questions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                {questions.length} Interview Questions
              </h3>
              <p className="text-sm text-slate-500">
                Model: {result.model} • {result.tokens_used} tokens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isPracticeMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsPracticeMode(!isPracticeMode)}
            >
              <MessageSquare size={14} />
              {isPracticeMode ? 'Exit Practice' : 'Practice Mode'}
            </Button>
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
      </Card>

      {/* Practice Mode Banner */}
      {isPracticeMode && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-teal-600" />
            <div>
              <div className="font-medium text-teal-900">Practice Mode Active</div>
              <div className="text-sm text-teal-700">
                Click on each question to expand and practice your answer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            question={question}
            index={index}
            isPracticeMode={isPracticeMode}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main Interview Questions Generator Page
 */
export default function InterviewQuestions() {
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
    resolver: zodResolver(questionsSchema),
    defaultValues: {
      company_name: '',
      job_title: '',
      job_description: '',
      question_count: 10,
      application_id: applicationId ? parseInt(applicationId) : undefined
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedApplicationId = watch('application_id');
  const questionCount = watch('question_count');

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
    mutationFn: generateInterviewQuestions,
    onSuccess: (data) => {
      setResult(data);
      setIsFavorite(false);
      toast({
        title: 'Questions generated!',
        description: 'Practice these questions to ace your interview.',
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
    const payload = {
      ...data,
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <HelpCircle size={20} className="text-white" />
              </div>
              Interview Questions
            </h1>
            <p className="text-slate-500 mt-1">
              Generate practice questions tailored to your target role
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form - 2 columns */}
        <Card className="lg:col-span-2 p-6 h-fit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            {/* Company & Job Title */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('company_name')}
                  placeholder="Google"
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
                  placeholder="Software Engineer"
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
                placeholder="Paste the job description with requirements and responsibilities..."
                rows={8}
                error={errors.job_description?.message}
              />
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setValue('question_count', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="w-12 text-center font-semibold text-slate-900">
                  {questionCount}
                </span>
              </div>
            </div>

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
                  Generate Questions
                </>
              )}
            </Button>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="font-semibold text-amber-900 flex items-center gap-2 text-sm">
              <Sparkles size={14} className="text-amber-600" />
              Interview Tips
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-amber-800">
              <li>• Use the STAR method for behavioral questions</li>
              <li>• Prepare 2-3 examples for each skill</li>
              <li>• Practice out loud for better delivery</li>
              <li>• Research the company culture beforehand</li>
            </ul>
          </div>
        </Card>

        {/* Results - 3 columns */}
        <div className="lg:col-span-3">
          {generateMutation.isPending ? (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 animate-pulse">
                  <HelpCircle size={36} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Generating Questions
                </h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  Our AI is analyzing the job requirements to create relevant interview questions...
                </p>
                <div className="flex items-center gap-2 mt-6">
                  <Loader2 size={16} className="animate-spin text-orange-600" />
                  <span className="text-sm text-slate-500">This may take 10-30 seconds</span>
                </div>
              </div>
            </Card>
          ) : result ? (
            <QuestionsResult
              result={result}
              onCopy={() => toast({ title: 'Copied to clipboard!', variant: 'success' })}
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              isFavorite={isFavorite}
            />
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                  <HelpCircle size={36} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Ready to Generate
                </h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  Enter the job details and we'll generate customized interview questions for your preparation.
                </p>

                {/* Question Types Preview */}
                <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
                  {[
                    { label: 'Behavioral', icon: '💭' },
                    { label: 'Technical', icon: '💻' },
                    { label: 'Situational', icon: '🎯' },
                    { label: 'Culture Fit', icon: '🤝' }
                  ].map((type) => (
                    <div key={type.label} className="p-3 rounded-lg bg-slate-50 text-center">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="text-sm font-medium text-slate-700 mt-1">{type.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
