import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertCircle, 
  Check, 
  Sparkles,
  BookOpen
} from "lucide-react";
import { quizQuestions } from "../data/quizData";
import { UserProgress, QuizItem } from "../types";

interface MyMistakesProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onTabChange: (tab: string) => void;
}

export default function MyMistakes({ progress, onUpdateProgress, onTabChange }: MyMistakesProps) {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  // Filter only quiz items whose IDs exist in the progress mistakes list
  const mistakeQuizzes = quizQuestions.filter((q) => progress.mistakes.includes(q.id));

  const handleStartRetry = (qId: string) => {
    setActiveQuizId(qId);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleAnswerSubmit = (quiz: QuizItem, ans: string | number) => {
    if (isAnswered) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const isCorrect = String(ans) === String(quiz.answer);

    if (isCorrect) {
      // Correct! Remove from mistakes list
      const updatedMistakes = progress.mistakes.filter((id) => id !== quiz.id);
      
      // Add to completed quizzes if not there
      const updatedCompleted = [...progress.completedQuizzes];
      if (!updatedCompleted.includes(quiz.id)) {
        updatedCompleted.push(quiz.id);
      }

      setTimeout(() => {
        onUpdateProgress({
          mistakes: updatedMistakes,
          completedQuizzes: updatedCompleted,
        });
        setActiveQuizId(null); // Reset
      }, 2500); // Wait 2.5 seconds so user reads explanation and sees correct effect
    }
  };

  const handleDeleteMistake = (qId: string) => {
    if (window.confirm("이 문제를 오답 목록에서 삭제하시겠습니까? (학습 진도에는 반영되지 않습니다)")) {
      const updatedMistakes = progress.mistakes.filter((id) => id !== qId);
      onUpdateProgress({ mistakes: updatedMistakes });
      if (activeQuizId === qId) setActiveQuizId(null);
    }
  };

  const handleClearAllMistakes = () => {
    if (window.confirm("정말로 모든 오답 목록을 초기화하시겠습니까?")) {
      onUpdateProgress({ mistakes: [] });
      setActiveQuizId(null);
    }
  };

  return (
    <div id="my-mistakes-root" className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            나의 오답 노트 보관소
          </h2>
          <p className="text-xs text-slate-500">틀린 문제를 반복 복습하여 온전히 자신의 지식으로 마스터하세요.</p>
        </div>

        {mistakeQuizzes.length > 0 && (
          <button
            onClick={handleClearAllMistakes}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            오답 전체 삭제
          </button>
        )}
      </div>

      {mistakeQuizzes.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-9 w-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">🎉 완벽합니다!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              현재 오답노트에 보관된 틀린 문제가 단 한 개도 없습니다. <br />
              실전 모의고사나 퀴즈 존에서 계속 도전하여 완벽한 만점을 노려보세요!
            </p>
          </div>
          <button
            onClick={() => onTabChange("quiz")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1"
          >
            퀴즈 풀러 가기
            <BookOpen className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Active mistakes list */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of mistakes */}
          <div className={`${activeQuizId !== null ? "hidden lg:block" : "block"} lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-2`}>
            {mistakeQuizzes.map((quiz, idx) => {
              const isActive = quiz.id === activeQuizId;
              return (
                <div
                  key={quiz.id}
                  className={`rounded-xl border p-4 text-left transition-all relative ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">오답 0{idx + 1}</span>
                    <button
                      onClick={() => handleDeleteMistake(quiz.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="이 문제 제거"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-3">
                    {quiz.question}
                  </p>

                  <button
                    onClick={() => handleStartRetry(quiz.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    오답 풀기
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active Question solving block */}
          <div className={`${activeQuizId === null ? "hidden lg:block" : "block"} lg:col-span-2`}>
            {activeQuizId === null ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-sm h-full flex flex-col items-center justify-center min-h-[250px]">
                <HelpCircle className="h-8 w-8 text-slate-400" />
                <h3 className="font-bold text-slate-700 text-sm">해결할 오답을 선택하세요</h3>
                <p className="text-xs text-slate-400">좌측 목록에서 오답 해소 문제를 고르면 이 공간에 로드됩니다.</p>
              </div>
            ) : (
              (() => {
                const activeQuiz = mistakeQuizzes.find((q) => q.id === activeQuizId);
                if (!activeQuiz) return null;

                return (
                  <motion.div
                    key={activeQuiz.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveQuizId(null)}
                          className="lg:hidden text-indigo-600 hover:underline font-bold text-xs mr-2 border border-slate-200 rounded px-2 py-1 bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          ← 목록으로
                        </button>
                        <span>RETRY MISTAKE</span>
                      </div>
                      <span>{activeQuiz.type === "ox" ? "OX 판정" : "4지선다형"}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 leading-relaxed font-sans">
                      Q. {activeQuiz.question}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeQuiz.options.map((option, idx) => {
                        const isOX = activeQuiz.type === "ox";
                        const optionVal = isOX ? option : idx;
                        const isSelected = selectedAnswer !== null && String(selectedAnswer) === String(optionVal);
                        const isCorrectAns = String(optionVal) === String(activeQuiz.answer);

                        let btnStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700";

                        if (isSelected) {
                          const isCorrect = String(selectedAnswer) === String(activeQuiz.answer);
                          btnStyle = isCorrect
                            ? "border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold"
                            : "border-rose-500 bg-rose-50/40 text-rose-950 font-bold";
                        } else if (isAnswered && isCorrectAns) {
                          btnStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-850 font-bold";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleAnswerSubmit(activeQuiz, optionVal)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xs text-slate-400 font-mono shrink-0">
                                {isOX ? (idx === 0 ? "O" : "X") : `( ${idx + 1} )`}
                              </span>
                              <span>{option}</span>
                            </div>
                            {isAnswered && isCorrectAns && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />}
                            {isSelected && String(selectedAnswer) !== String(activeQuiz.answer) && <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Retry Feedback and Auto Remove Explanation */}
                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`rounded-xl p-5 border text-xs leading-relaxed space-y-2.5 ${
                            String(selectedAnswer) === String(activeQuiz.answer)
                              ? "border-emerald-100 bg-emerald-50/20 text-emerald-950"
                              : "border-rose-100 bg-rose-50/20 text-rose-950"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-sm">
                            {String(selectedAnswer) === String(activeQuiz.answer) ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <span>훌륭합니다! 정답을 맞추셨습니다! 🎉</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-rose-600" />
                                <span>다시 확인해 보세요! 아직 이해가 부족합니다.</span>
                              </>
                            )}
                          </div>

                          <div className="border-t border-slate-200/50 pt-2 space-y-1">
                            <p className="font-bold text-slate-800">[오답 피드백 법리 해설]</p>
                            <p className="text-slate-700">{activeQuiz.explanation}</p>
                          </div>

                          {String(selectedAnswer) === String(activeQuiz.answer) && (
                            <p className="text-[10px] text-emerald-700 font-bold animate-pulse pt-1">
                              잠시 후 맞춘 문제로 인식되어 오답노트에서 자동으로 졸업 처리됩니다...
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
