import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assessmentsApi } from '../../api/assessments.api';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ClipboardCheck, ArrowLeft, Clock, Award, CheckCircle, XCircle, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssessmentsPage() {
  const [searchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId');
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active quiz playing state
  const [activeQuiz, setActiveQuiz] = useState<any>(null); // Details of assessment (with questions)
  const [activeAttempt, setActiveAttempt] = useState<any>(null); // Active attempt object
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { assessmentQuestionId: selectedLabel }
  const [timeLeft, setTimeLeft] = useState(0); // seconds left
  const timerRef = useRef<any>(null);
  
  // Results view state
  const [recentResult, setRecentResult] = useState<any>(null);

  // View attempts history state
  const [viewingHistoryAssessment, setViewingHistoryAssessment] = useState<any>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, assessmentsRes] = await Promise.all([
        dashboardApi.getDashboard(),
        assessmentsApi.list({ page: 1, limit: 100 })
      ]);

      const enrollments = dbRes.enrollments || [];
      setSubjects(enrollments.map((e: any) => e.subject).filter(Boolean));
      setAssessments(assessmentsRes.data || []);
      setError(null);
    } catch {
      setError('Failed to load assessments data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Timer Count Down
  useEffect(() => {
    if (activeAttempt && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAttempt, timeLeft]);

  const handleStartQuiz = async (assessment: any) => {
    try {
      setLoading(true);
      const [details, attempt] = await Promise.all([
        assessmentsApi.getById(assessment.id),
        assessmentsApi.startAttempt(assessment.id)
      ]);

      setActiveQuiz(details);
      setActiveAttempt(attempt);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimeLeft(details.duration * 60); // minutes to seconds
      setError(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to start quiz attempt');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (assessmentQuestionId: string, answerLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [assessmentQuestionId]: answerLabel
    }));
  };

  const submitQuizAnswers = async (finalAnswers: Record<string, string>) => {
    if (!activeAttempt || !activeQuiz) return;
    
    // Format answers: Array of { assessmentQuestionId, selectedAnswer }
    const answersArray = Object.entries(finalAnswers).map(([aqId, val]) => ({
      assessmentQuestionId: aqId,
      selectedAnswer: val
    }));

    try {
      setLoading(true);
      const result = await assessmentsApi.submitAttempt(activeAttempt.id, { answers: answersArray });
      setRecentResult({
        result: result.result,
        assessment: activeQuiz
      });
      setActiveQuiz(null);
      setActiveAttempt(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to submit attempt');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuizClick = () => {
    const questionsCount = activeQuiz.questions?.length || 0;
    const answeredCount = Object.keys(selectedAnswers).length;
    
    if (answeredCount < questionsCount) {
      if (!confirm(`You have only answered ${answeredCount} out of ${questionsCount} questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to complete and submit your quiz?')) {
        return;
      }
    }
    
    submitQuizAnswers(selectedAnswers);
  };

  const autoSubmitQuiz = () => {
    toast.error('Time limit reached! Submitting your answers automatically.');
    submitQuizAnswers(selectedAnswers);
  };

  const handleViewAttempts = async (assessment: any) => {
    try {
      setHistoryLoading(true);
      setViewingHistoryAssessment(assessment);
      const res = await assessmentsApi.getAttempts(assessment.id);
      setAttemptsHistory(res || []);
    } catch {
      toast.error('Failed to load attempts history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  // Render Quiz Playing View
  if (activeQuiz && activeAttempt) {
    const questions = activeQuiz.questions || [];
    const currentAQ = questions[currentQuestionIndex];
    const currentQuestion = currentAQ?.question;
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header bar with timer */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border border-gray-100 sticky top-0 z-10">
          <div>
            <h2 className="text-md font-bold text-gray-900 truncate max-w-md">
              {activeQuiz.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Subject: {activeQuiz.subject?.name}
            </p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
            timeLeft < 60 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-indigo-50 text-indigo-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Counter Grid */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Question progress</span>
            <span>{currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((aq: any, idx: number) => {
              const isAnswered = !!selectedAnswers[aq.id];
              const isCurrent = idx === currentQuestionIndex;
              
              let btnClass = "bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200";
              if (isAnswered) btnClass = "bg-green-50 text-green-700 border-green-200 font-semibold";
              if (isCurrent) btnClass = "bg-indigo-600 text-white border-indigo-600 font-semibold shadow";
              
              return (
                <button
                  key={aq.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion ? (
          <Card className="p-6 md:p-8 space-y-6 border border-gray-100">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="info">
                  Difficulty: {currentQuestion.difficulty}
                </Badge>
                <span className="text-xs font-bold text-gray-400">
                  Marks: {currentAQ.marks}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.type === 'TRUE_FALSE' ? (
                ['TRUE', 'FALSE'].map((optVal) => (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => handleSelectAnswer(currentAQ.id, optVal)}
                    className={`w-full p-4 text-left border rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                      selectedAnswers[currentAQ.id] === optVal
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{optVal === 'TRUE' ? 'True' : 'False'}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAnswers[currentAQ.id] === optVal ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentAQ.id] === optVal && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                ))
              ) : (
                currentQuestion.options?.map((opt: any) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAnswer(currentAQ.id, opt.label)}
                    className={`w-full p-4 text-left border rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                      selectedAnswers[currentAQ.id] === opt.label
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-indigo-600">{opt.label}.</span>
                      <span>{opt.text}</span>
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedAnswers[currentAQ.id] === opt.label ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentAQ.id] === opt.label && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <Button
                variant="secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Previous
              </Button>
              
              {isLast ? (
                <Button
                  onClick={handleSubmitQuizClick}
                >
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Error rendering question.</p>
          </Card>
        )}
      </div>
    );
  }

  // Render Post-Quiz Results View
  if (recentResult) {
    const { result, assessment } = recentResult;
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <Card className="p-8 border border-gray-100 space-y-6">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-green-50 rounded-full text-green-500 mb-4">
              <Award className="w-14 h-14" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Assessment Completed!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Thank you for submitting your attempt for: <strong>{assessment.title}</strong>
            </p>
          </div>

          {/* Core Score breakdown */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase">Obtained Marks</p>
              <p className="text-xl font-black text-gray-900 mt-1">{result.obtainedMarks} / {result.totalMarks}</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-xs text-gray-400 font-bold uppercase">Correct Answers</p>
              <p className="text-xl font-black text-green-600 mt-1">{result.correctAnswers}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-bold uppercase">Grade Score</p>
              <p className="text-xl font-black text-indigo-600 mt-1">{Math.round(result.percentage)}%</p>
            </div>
          </div>

          {/* Quick analysis summary */}
          <div className="text-sm text-gray-600 max-w-md mx-auto flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Correct: {result.correctAnswers}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Incorrect: {result.incorrectAnswers}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Unanswered: {result.unanswered}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              onClick={() => {
                setRecentResult(null);
                fetchData();
              }}
            >
              Back to Assessments
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const attemptId = result.attemptId;
                setRecentResult(null);
                navigate(`/student/results?attemptId=${attemptId}`);
              }}
            >
              View Detailed Explanations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-purple-100" />
            Assessments & Quizzes
          </h1>
          <p className="text-purple-100 mt-2 text-sm md:text-base">
            Take practice tests, mock exams, or past papers and review explanations.
          </p>
        </div>
        <div className="hidden sm:block">
          <Award className="w-16 h-16 text-purple-200/50" />
        </div>
      </div>

      {/* Grid listing assessments */}
      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((ass: any) => {
            const isEnrolledParam = !subjectIdParam || ass.subjectId === subjectIdParam;
            if (!isEnrolledParam) return null;

            return (
              <Card key={ass.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-600">
                      {ass.subject?.name}
                    </span>
                    <Badge variant="info" size="sm">
                      {ass.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {ass.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Duration: {ass.duration} mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Total Marks: {ass.totalMarks}
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Max Allowed Attempts: {ass.maxAttempts || 'Unlimited'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewAttempts(ass)}
                    className="px-3.5 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-all"
                  >
                    View Attempt History
                  </button>
                  <button
                    onClick={() => handleStartQuiz(ass)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    Start Assessment
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No assessments scheduled</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            There are no active assessments scheduled for you at this time.
          </p>
        </Card>
      )}

      {/* Viewing Attempt History Modal */}
      {viewingHistoryAssessment && (
        <Modal
          isOpen={!!viewingHistoryAssessment}
          onClose={() => setViewingHistoryAssessment(null)}
          title={`Attempt History: ${viewingHistoryAssessment.title}`}
        >
          <div className="space-y-4 max-w-lg min-h-[160px]">
            {historyLoading ? (
              <LoadingState />
            ) : attemptsHistory.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {attemptsHistory.map((att: any) => (
                  <div key={att.id} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-150 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-gray-700">Attempt #{att.attemptNumber}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Taken: {new Date(att.startedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {att.status === 'SUBMITTED' && att.result ? (
                        <>
                          <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                            Score: {Math.round(att.result.percentage)}%
                          </span>
                          <button
                            onClick={() => {
                              setViewingHistoryAssessment(null);
                              navigate(`/student/results?attemptId=${att.id}`);
                            }}
                            className="block text-[10px] text-indigo-600 hover:underline font-bold mt-1.5"
                          >
                            View Explanations &rarr;
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded-full">
                          {att.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 italic">
                You haven't attempted this assessment yet.
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setViewingHistoryAssessment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
