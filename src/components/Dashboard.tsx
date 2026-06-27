import React from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Award, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  Scale
} from "lucide-react";
import { UserProgress, QuizItem } from "../types";
import { studyChapters } from "../data/studyData";
import { quizQuestions } from "../data/quizData";

interface DashboardProps {
  progress: UserProgress;
  onTabChange: (tab: string) => void;
  onSelectChapter: (chapterId: string) => void;
}

export default function Dashboard({ progress, onTabChange, onSelectChapter }: DashboardProps) {
  // Calculate stats
  const totalChapters = studyChapters.length;
  const completedChaptersCount = progress.completedChapters.length;
  const chapterProgressPercent = Math.round((completedChaptersCount / totalChapters) * 100);

  const totalQuizzes = quizQuestions.length;
  const solvedQuizzesCount = progress.completedQuizzes.length;
  const quizProgressPercent = Math.round((solvedQuizzesCount / totalQuizzes) * 100);

  const totalMistakes = progress.mistakes.length;

  const mockExams = progress.mockHistory;
  const totalMockExams = mockExams.length;
  const averageMockScore = totalMockExams > 0 
    ? Math.round(mockExams.reduce((acc, curr) => acc + curr.score, 0) / totalMockExams * (100 / 15)) 
    : 0;

  const lastMockExam = mockExams[mockExams.length - 1];

  return (
    <div id="dashboard-root" className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-slate-700/20 blur-2xl"></div>
        <div className="absolute right-20 bottom-0 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            공정거래 시험 완벽 대비 솔루션
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl font-sans">
            공정거래법 마스터로 <br className="sm:hidden" /> 합격을 시작하세요!
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            공정거래위원회의 역할 및 사건 처리 절차부터 가맹사업법, 하도급법, 대규모유통업법, 대리점법 등 '갑을관계 4대 핵심 법률'까지 최신 기출 트렌드를 담았습니다.
          </p>
        </div>
      </div>

      {/* Progress Stats Bento Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Study Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">핵심 이론 진도율</span>
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">{completedChaptersCount}</span>
              <span className="text-sm text-slate-500">/ {totalChapters} 개 챕터</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div 
                className="h-2 rounded-full bg-indigo-600 transition-all duration-500" 
                style={{ width: `${chapterProgressPercent}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right text-xs font-semibold text-indigo-600">
              {chapterProgressPercent}% 완료
            </div>
          </div>
        </div>

        {/* Stat 2: Quiz Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">기본 퀴즈 극복</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">{solvedQuizzesCount}</span>
              <span className="text-sm text-slate-500">/ {totalQuizzes} 문항 정복</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div 
                className="h-2 rounded-full bg-emerald-600 transition-all duration-500" 
                style={{ width: `${quizProgressPercent}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right text-xs font-semibold text-emerald-600">
              {quizProgressPercent}% 완료
            </div>
          </div>
        </div>

        {/* Stat 3: Mistakes Count */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">오답노트 보관함</span>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">{totalMistakes}</span>
              <span className="text-sm text-slate-500">개 문제 대기중</span>
            </div>
          </div>
          <button 
            onClick={() => onTabChange("mistakes")}
            className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors w-full cursor-pointer"
          >
            오답 정복하러 가기
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stat 4: Mock Test Average */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">모의고사 평균</span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">{averageMockScore}</span>
              <span className="text-sm text-slate-500">점 (합격선 60점)</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>응시 횟수: {totalMockExams}회</span>
              {lastMockExam && (
                <span className={`font-semibold ${lastMockExam.passed ? "text-emerald-600" : "text-rose-600"}`}>
                  최근: {Math.round(lastMockExam.score * (100 / 15))}점 ({lastMockExam.passed ? "합격" : "불합격"})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Quick Chapters & Study Road */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              과목별 학습 로드맵
            </h2>
            <button 
              onClick={() => onTabChange("study")} 
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              전체 보기
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {studyChapters.map((chapter, idx) => {
              const isCompleted = progress.completedChapters.includes(chapter.id);
              return (
                <div 
                  key={chapter.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer"
                  onClick={() => {
                    onSelectChapter(chapter.id);
                    onTabChange("study");
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <span className="text-xs font-bold font-mono">0{idx + 1}</span>
                    </div>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        완료
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {chapter.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {chapter.sections[0]?.title} 등 핵심 규제와 상세 법리 수록.
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-slate-600 group-hover:text-indigo-600">
                    학습 시작하기
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: AI Smart Guide & Quick Mock Test */}
        <div className="space-y-6">
          {/* AI Helper Banner Card */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI 법률 튜터 챗봇</h3>
                <p className="text-xs text-purple-600 font-semibold">Gemini 기반 무한 문답</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              공부하다가 막히는 담합 위법요건, 가맹점주 보호 기간 등 까다로운 대한민국 법률 문구를 인공지능 전문 변호사에게 물어보듯 명쾌하게 해결하세요!
            </p>
            <button 
              onClick={() => onTabChange("aitutor")}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-purple-800 hover:to-indigo-800 transition-colors cursor-pointer"
            >
              AI 튜터와 대화하기
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Mock Test Start Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              실전 모의고사
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              6대 대주제에서 무작위로 추출된 15문항을 시험지 규격에 맞춰 풀어봅니다. 타이머 제어와 실전 배점으로 합격 여부를 판정해 드립니다.
            </p>
            <div className="rounded-lg bg-slate-50 p-3 flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>⏱️ 제한 시간: 15분</span>
              <span>💯 문항수: 15문항</span>
            </div>
            <button 
              onClick={() => onTabChange("mock")}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              모의고사 바로 풀기
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper inside Dashboard
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
