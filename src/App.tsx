import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  BookOpen, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Menu, 
  X,
  GraduationCap
} from "lucide-react";

// Components
import Dashboard from "./components/Dashboard";
import StudyNotes from "./components/StudyNotes";
import QuizZone from "./components/QuizZone";
import MockExam from "./components/MockExam";
import MyMistakes from "./components/MyMistakes";
import AITutor from "./components/AITutor";

// Types
import { UserProgress } from "./types";

const LOCAL_STORAGE_KEY = "fair_trade_study_progress_v1";

const initialProgress: UserProgress = {
  completedChapters: [],
  completedQuizzes: [],
  mistakes: [],
  mockHistory: []
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgress>(initialProgress);

  // Load progress from localStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved progress:", e);
      }
    }
  }, []);

  // Sync / Update state & persistent storage
  const handleUpdateProgress = (newProgress: Partial<UserProgress>) => {
    setProgress((prev) => {
      const updated = { ...prev, ...newProgress };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Completed chapter toggler
  const handleToggleChapterComplete = (chapterId: string) => {
    const currentCompleted = [...progress.completedChapters];
    const idx = currentCompleted.indexOf(chapterId);
    if (idx > -1) {
      currentCompleted.splice(idx, 1);
    } else {
      currentCompleted.push(chapterId);
    }
    handleUpdateProgress({ completedChapters: currentCompleted });
  };

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "study", label: "학습 노트", icon: <BookOpen className="h-4 w-4" /> },
    { id: "quiz", label: "단원별 퀴즈", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "mock", label: "실전 모의고사", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "mistakes", label: "오답 노트", icon: <AlertCircle className="h-4 w-4" /> },
    { id: "aitutor", label: "AI 스마트 튜터", icon: <Sparkles className="h-4 w-4" /> }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => handleTabChange("dashboard")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="rounded-xl bg-slate-900 p-2.5 text-white transition-all group-hover:bg-indigo-600 shadow-md shadow-slate-950/10">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight font-sans">공정거래 시험 공부</span>
              <span className="hidden sm:inline-block ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 font-mono">FTC STUDY MASTER</span>
            </div>
          </div>

          {/* Desktop Tab Menu */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.id === "mistakes" && progress.mistakes.length > 0 && (
                    <span className="ml-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden shadow-inner sticky top-16 z-30"
          >
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-slate-900 text-white" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.id === "mistakes" && progress.mistakes.length > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-mono text-white font-bold">
                        {progress.mistakes.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-28 lg:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                progress={progress}
                onTabChange={handleTabChange}
                onSelectChapter={setSelectedChapterId}
              />
            )}
            
            {activeTab === "study" && (
              <StudyNotes 
                progress={progress}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                onToggleChapterComplete={handleToggleChapterComplete}
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === "quiz" && (
              <QuizZone 
                progress={progress}
                onUpdateProgress={handleUpdateProgress}
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === "mock" && (
              <MockExam 
                progress={progress}
                onUpdateProgress={handleUpdateProgress}
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === "mistakes" && (
              <MyMistakes 
                progress={progress}
                onUpdateProgress={handleUpdateProgress}
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === "aitutor" && (
              <AITutor 
                onTabChange={handleTabChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (Sticky at bottom, hidden on desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200/80 z-40 pb-safe-bottom shadow-[0_-3px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="grid grid-cols-6 gap-0.5 px-1 py-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-1 rounded-xl transition-all relative cursor-pointer ${
                  isActive 
                    ? "text-indigo-600" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-indigo-50 text-indigo-600" : ""}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { className: "h-4.5 w-4.5" })}
                </div>
                <span className="text-[9px] font-black tracking-tight">{item.label.replace("AI ", "AI") === "AI 스마트 튜터" ? "AI튜터" : item.label.split(" ").pop()}</span>
                {item.id === "mistakes" && progress.mistakes.length > 0 && (
                  <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* App Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1.5 text-xs text-slate-400 font-medium">
          <p>© 2026 대한민국 공정거래 시험 공부 마스터. All Rights Reserved.</p>
          <p className="font-mono text-[10px]">공정거래위원회 소관 4대 법률(가맹·하도급·유통·대리점) 및 사건 처리 지침 수록</p>
        </div>
      </footer>
    </div>
  );
}

