import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  FileText,
  AlertCircle,
  TrendingUp,
  Brain
} from "lucide-react";
import { studyChapters } from "../data/studyData";
import { quizQuestions } from "../data/quizData";
import { UserProgress, QuizItem } from "../types";

interface QuizZoneProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onTabChange: (tab: string) => void;
}

export default function QuizZone({ progress, onUpdateProgress, onTabChange }: QuizZoneProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(studyChapters[0].id);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Filter questions matching current chapter
  const currentQuizzes = quizQuestions.filter(q => q.chapterId === selectedChapterId);
  const currentQuestion = currentQuizzes[currentQuestionIdx];

  const handleChapterChange = (id: string) => {
    setSelectedChapterId(id);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleAnswerSubmit = (ans: string | number) => {
    if (isAnswered) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const isCorrect = String(ans) === String(currentQuestion.answer);

    if (isCorrect) {
      setScore(prev => prev + 1);
      // Save completed quiz
      if (!progress.completedQuizzes.includes(currentQuestion.id)) {
        onUpdateProgress({
          completedQuizzes: [...progress.completedQuizzes, currentQuestion.id]
        });
      }
    } else {
      // Add to mistakes (My mistakes notes)
      if (!progress.mistakes.includes(currentQuestion.id)) {
        onUpdateProgress({
          mistakes: [...progress.mistakes, currentQuestion.id]
        });
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (currentQuestionIdx + 1 < currentQuizzes.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div id="quiz-zone-root" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Chapter Selection Panel */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 hidden lg:block">단원별 퀴즈 선택</h3>
        
        {/* Mobile Selector Dropdown */}
        <div className="lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">학습 단원 선택</label>
          <select
            value={selectedChapterId}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {studyChapters.map((chapter) => {
              const chapterQuizzesCount = quizQuestions.filter(q => q.chapterId === chapter.id).length;
              return (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title} ({chapterQuizzesCount}문항)
                </option>
              );
            })}
          </select>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block space-y-1.5">
          {studyChapters.map((chapter) => {
            const isActive = chapter.id === selectedChapterId;
            const chapterQuizzesCount = quizQuestions.filter(q => q.chapterId === chapter.id).length;
            
            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterChange(chapter.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
                }`}
              >
                <span className="truncate pr-2">{chapter.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {chapterQuizzesCount}문항
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="lg:col-span-3">
        {currentQuizzes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">문제가 등록되지 않았습니다</h3>
            <p className="text-xs text-slate-500">다른 단원을 선택해 퀴즈를 풀어보세요.</p>
          </div>
        ) : quizFinished ? (
          /* Finished Screen */
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 text-center space-y-6 shadow-sm"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans">단원 정복 완료!</h2>
              <p className="text-xs text-slate-500">
                수고하셨습니다. "{studyChapters.find(c => c.id === selectedChapterId)?.title}" 퀴즈를 마쳤습니다.
              </p>
            </div>

            <div className="max-w-xs mx-auto rounded-xl bg-slate-50 p-4 border border-slate-100 font-mono space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>푼 문제수:</span>
                <span className="font-bold">{currentQuizzes.length}문항</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span>맞춘 정답수:</span>
                <span className="font-bold text-emerald-600">{score}문항</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold">
                <span>정답률:</span>
                <span className="text-indigo-600">{Math.round((score / currentQuizzes.length) * 100)}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-slate-400" />
                다시 풀기
              </button>
              <button
                onClick={() => onTabChange("study")}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                이론 노트 보러가기
              </button>
            </div>
          </motion.div>
        ) : (
          /* Question View Screen */
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4">
                <span>{studyChapters.find(c => c.id === selectedChapterId)?.title}</span>
                <span className="font-mono text-indigo-600">
                  {currentQuestionIdx + 1} / {currentQuizzes.length} 문항
                </span>
              </div>

              {/* Progress indicator Bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / currentQuizzes.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                  <Brain className="h-3 w-3" />
                  {currentQuestion.type === "ox" ? "OX 판정 퀴즈" : "4지선다 기출 예상"}
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed font-sans">
                  Q. {currentQuestion.question}
                </h2>
              </div>

              {/* Option Select List */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const isOX = currentQuestion.type === "ox";
                  const optionVal = isOX ? option : idx;
                  const isSelected = selectedAnswer !== null && String(selectedAnswer) === String(optionVal);
                  const isCorrectAns = String(optionVal) === String(currentQuestion.answer);

                  let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700";
                  
                  if (isSelected) {
                    const isCorrect = String(selectedAnswer) === String(currentQuestion.answer);
                    btnStyle = isCorrect 
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 shadow-sm" 
                      : "border-rose-500 bg-rose-50/40 text-rose-900 shadow-sm";
                  } else if (isAnswered && isCorrectAns) {
                    btnStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-800 font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerSubmit(optionVal)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xs text-slate-400 shrink-0 font-mono">
                          {isOX ? (idx === 0 ? "O" : "X") : `( ${idx + 1} )`}
                        </span>
                        <span>{option}</span>
                      </div>
                      
                      {isAnswered && isCorrectAns && (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      )}
                      {isSelected && String(selectedAnswer) !== String(currentQuestion.answer) && (
                        <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate feedback and explanation block */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-5 border text-xs leading-relaxed space-y-2 ${
                      String(selectedAnswer) === String(currentQuestion.answer)
                        ? "border-emerald-100 bg-emerald-50/20 text-emerald-950"
                        : "border-rose-100 bg-rose-50/20 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      {String(selectedAnswer) === String(currentQuestion.answer) ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <span>정답입니다!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-rose-600" />
                          <span>오답입니다! (오답노트에 자동 보관되었습니다)</span>
                        </>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-200/50 pt-2 mt-2 space-y-1">
                      <p className="font-bold text-slate-800">[정답근거 및 공정거래 법리 해설]</p>
                      <p className="text-slate-700">{currentQuestion.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button bar */}
              {isAnswered && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    {currentQuestionIdx + 1 < currentQuizzes.length ? "다음 문제" : "결과 보기"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
