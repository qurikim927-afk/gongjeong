import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Check, 
  FileText, 
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Brain
} from "lucide-react";
import { quizQuestions } from "../data/quizData";
import { UserProgress, QuizItem } from "../types";

interface MockExamProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onTabChange: (tab: string) => void;
}

export default function MockExam({ progress, onUpdateProgress, onTabChange }: MockExamProps) {
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examQuizzes, setExamQuizzes] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({}); // { questionId: answer }
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<{ score: number; passed: boolean } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 15 random unique questions from bank
  const startNewExam = () => {
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15);
    setExamQuizzes(selected);
    setAnswers({});
    setTimeLeft(15 * 60);
    setExamSubmitted(false);
    setExamResult(null);
    setExamStarted(true);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (examStarted && !examSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitExam(true); // Auto-submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examSubmitted]);

  // Format Time Helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (qId: string, value: string | number) => {
    if (examSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const handleSubmitExam = (isTimeOver = false) => {
    if (examSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    const newMistakes = [...progress.mistakes];

    examQuizzes.forEach((quiz) => {
      const userAns = answers[quiz.id];
      const isCorrect = String(userAns) === String(quiz.answer);
      if (isCorrect) {
        correctCount++;
      } else {
        // Add to mistakes list if not already there
        if (!newMistakes.includes(quiz.id)) {
          newMistakes.push(quiz.id);
        }
      }
    });

    const passed = correctCount >= 9; // 60% of 15 is 9
    setExamResult({ score: correctCount, passed });
    setExamSubmitted(true);

    // Update global progress history
    const dateStr = new Date().toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newHistoryItem = {
      date: dateStr,
      score: correctCount,
      total: 15,
      passed,
    };

    onUpdateProgress({
      mockHistory: [...progress.mockHistory, newHistoryItem],
      mistakes: newMistakes,
    });
  };

  return (
    <div id="mock-exam-root" className="space-y-6">
      {!examStarted ? (
        /* Intro Landing Screen */
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 md:p-12 text-center space-y-6 shadow-sm">
          <div className="h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <TrendingUp className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 font-sans">실전 모의고사 시뮬레이터</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              공정위 역할 및 공정거래 4대 핵심 법률을 포괄하는 기출 문항들이 무작위로 15문항 출제됩니다. 실전처럼 시간을 재고 실력을 평가해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border border-slate-100 rounded-xl p-4 bg-slate-50 max-w-sm mx-auto font-mono text-xs text-slate-700">
            <div className="text-center border-r border-slate-200">
              <span className="block text-slate-400">문항 수</span>
              <span className="text-base font-bold text-slate-800">15문항</span>
            </div>
            <div className="text-center border-r border-slate-200">
              <span className="block text-slate-400">제한시간</span>
              <span className="text-base font-bold text-slate-800">15분</span>
            </div>
            <div className="text-center">
              <span className="block text-slate-400">합격 기준</span>
              <span className="text-base font-bold text-emerald-600">60점 (9개)</span>
            </div>
          </div>

          <button
            onClick={startNewExam}
            className="px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer"
          >
            모의고사 시작하기 (착석)
          </button>
        </div>
      ) : examSubmitted ? (
        /* Exam Finished / Score Report Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Result Overview Card */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6 text-center">
              <span className="text-xs font-bold tracking-widest text-slate-400 block uppercase">EXAM REPORT</span>
              
              <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto bg-slate-50">
                {examResult?.passed ? (
                  <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-rose-600" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {examResult?.passed ? "🎉 합격을 축하합니다!" : "😢 다음 기회에 합격해요!"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  합격선은 15문제 중 9문제(60점) 이상 정답 취득입니다.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 font-mono space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>획득한 점수:</span>
                  <span className="font-bold text-lg">{examResult ? Math.round(examResult.score * (100 / 15)) : 0} 점</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2">
                  <span>정답 맞춤:</span>
                  <span className="font-bold text-emerald-600">{examResult?.score} / 15 문항</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-6">
              <button
                onClick={startNewExam}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                새로운 모의고사 응시
              </button>
              <button
                onClick={() => onTabChange("mistakes")}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                오답노트 보러 가기
              </button>
            </div>
          </div>

          {/* Right Column: Reviewed Questions detail */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              출제 문항 상세 리뷰
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {examQuizzes.map((quiz, idx) => {
                const userAns = answers[quiz.id];
                const isCorrect = String(userAns) === String(quiz.answer);
                return (
                  <div 
                    key={quiz.id}
                    className={`rounded-xl border p-5 bg-white space-y-3 shadow-sm ${
                      isCorrect ? "border-emerald-100" : "border-rose-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">문제 0{idx + 1}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {isCorrect ? "정답" : "오답"}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {quiz.question}
                    </p>

                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-800">내가 입력한 답안: </span>
                        <span>{userAns !== undefined ? (quiz.type === "ox" ? userAns : quiz.options[userAns as number]) : "미입력"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-700">실제 정답: </span>
                        <span className="font-bold text-emerald-800">
                          {quiz.type === "ox" ? quiz.answer : quiz.options[quiz.answer as number]}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                      <span className="font-bold block text-slate-700 mb-0.5">💡 법리 해설:</span>
                      {quiz.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Active Testing Screen */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Question Scroll list */}
          <div className="lg:col-span-3 space-y-6">
            {/* Countdown Floating Card */}
            <div className="sticky top-16 lg:top-20 z-20 flex items-center justify-between bg-slate-900 text-white rounded-xl px-4 py-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-xs font-bold font-mono tracking-wider flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-rose-400 animate-pulse" />
                  시간 {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-bold text-indigo-300 font-mono">
                  마킹: {Object.keys(answers).length} / 15
                </span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("정말로 답안지를 제출하고 평가하시겠습니까?")) {
                    handleSubmitExam();
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                시험지 제출
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-8">
              {examQuizzes.map((quiz, idx) => {
                const userAns = answers[quiz.id];
                return (
                  <div 
                    key={quiz.id}
                    id={`quiz-card-${idx}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                      <span className="font-mono">문항 {idx + 1} / 15</span>
                      <span>•</span>
                      <span>{quiz.type === "ox" ? "OX 문항" : "4지선다형"}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                      {quiz.question}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {quiz.options.map((option, oIdx) => {
                        const isOX = quiz.type === "ox";
                        const optionVal = isOX ? option : oIdx;
                        const isSelected = userAns !== undefined && String(userAns) === String(optionVal);

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(quiz.id, optionVal)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-2">
                              {isOX ? (oIdx === 0 ? "O" : "X") : `[ ${oIdx + 1} ]`}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OMR Marking Board Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">OMR 답안지 마킹 보드</h4>
                <p className="text-[10px] text-slate-500">답안지 누락 문항이 있는지 확인하세요.</p>
              </div>

              {/* Grid 5 columns */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {examQuizzes.map((quiz, idx) => {
                  const marked = answers[quiz.id] !== undefined;
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        const element = document.getElementById(`quiz-card-${idx}`);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className={`h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
                        marked 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress counter */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>마킹된 문항:</span>
                <span className="font-bold text-indigo-600">
                  {Object.keys(answers).length} / 15
                </span>
              </div>

              <button
                onClick={() => {
                  if (window.confirm("정말로 답안지를 제출하고 채점하시겠습니까?")) {
                    handleSubmitExam();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                시험지 최종 완료 제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
