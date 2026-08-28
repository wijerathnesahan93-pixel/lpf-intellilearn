import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assessmentsApi } from '../../api/assessments.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { ClipboardCheck, ArrowLeft, Award, CheckCircle2, XCircle, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react';

export default function StudentResultsPage() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = async () => {
    if (!attemptId) {
      setError('No attempt ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await assessmentsApi.getResults(attemptId);
      setAttempt(data);
      setError(null);
    } catch {
      setError('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!attempt) return null;

  const { assessment, result, answers } = attempt;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/student/assessments?subjectId=${assessment?.subjectId}`)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assessments
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider bg-indigo-750/50 px-2.5 py-1 rounded-full">
          Results Feedback
        </span>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          {assessment?.title}
        </h1>
        <p className="text-indigo-100 mt-1 text-sm">
          Detailed breakdown of your assessment attempt, explanations, and key learning points.
        </p>
      </div>

      {/* Stat Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Grade Score</p>
            <p className="text-2xl font-black text-indigo-700 mt-0.5">{Math.round(result?.percentage)}%</p>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3.5 bg-green-50 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Correct</p>
            <p className="text-2xl font-black text-green-600 mt-0.5">{result?.correctAnswers} answers</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3.5 bg-red-50 rounded-xl text-red-500">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Incorrect</p>
            <p className="text-2xl font-black text-red-500 mt-0.5">{result?.incorrectAnswers} answers</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Marks Awarded</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{result?.obtainedMarks} / {result?.totalMarks}</p>
          </div>
        </Card>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-indigo-500" />
          Detailed Questions Review
        </h2>

        {assessment?.questions?.map((aq: any, index: number) => {
          const question = aq.question;
          const answer = answers?.find((a: any) => a.assessmentQuestionId === aq.id);
          const isCorrect = answer?.isCorrect;
          
          return (
            <Card key={aq.id} className={`border ${isCorrect ? 'border-green-150 bg-green-50/10' : 'border-red-150 bg-red-50/10'} space-y-4`}>
              {/* Question metadata */}
              <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {index + 1}
                  </span>
                  <Badge variant="default" size="sm">
                    {question?.difficulty}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500">
                    Marks: {answer?.marksAwarded || 0} / {aq.marks}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-sm md:text-base font-bold text-gray-800 leading-relaxed">
                {question?.text}
              </h3>

              {/* Answers Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Your Answer:</span>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className={isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                      {answer?.selectedAnswer || 'Not answered'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Correct Answer:</span>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{question?.correctAnswer}</span>
                  </div>
                </div>
              </div>

              {/* Question Options List */}
              {question?.type === 'MULTIPLE_CHOICE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  {question.options?.map((opt: any) => {
                    const isSelected = answer?.selectedAnswer === opt.label;
                    const isCorrectOption = question.correctAnswer === opt.label;
                    
                    let bg = "bg-white border-gray-200 text-gray-700";
                    if (isSelected) bg = "bg-red-50 border-red-200 text-red-800";
                    if (isCorrectOption) bg = "bg-green-50 border-green-200 text-green-800";

                    return (
                      <div key={opt.id} className={`p-3 border rounded-xl flex items-start gap-2 ${bg}`}>
                        <span className="font-bold">{opt.label}.</span>
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Question explanation text */}
              {question?.explanation && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Answer Explanation:
                  </h4>
                  <p className="text-xs text-indigo-800 leading-relaxed italic">
                    {question.explanation}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
