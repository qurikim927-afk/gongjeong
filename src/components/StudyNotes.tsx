import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  FileText, 
  Scale, 
  Store, 
  Briefcase, 
  Check, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { studyChapters } from "../data/studyData";
import { UserProgress } from "../types";

interface StudyNotesProps {
  progress: UserProgress;
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  onToggleChapterComplete: (chapterId: string) => void;
  onTabChange: (tab: string) => void;
}

export default function StudyNotes({ 
  progress, 
  selectedChapterId, 
  onSelectChapter, 
  onToggleChapterComplete,
  onTabChange
}: StudyNotesProps) {
  const [activeChapterId, setActiveChapterId] = useState<string>(selectedChapterId || studyChapters[0].id);
  const [expandedSectionIdx, setExpandedSectionIdx] = useState<number | null>(0);

  useEffect(() => {
    if (selectedChapterId) {
      setActiveChapterId(selectedChapterId);
      setExpandedSectionIdx(0);
      onSelectChapter(null); // Reset after setting active
    }
  }, [selectedChapterId]);

  const activeChapter = studyChapters.find(c => c.id === activeChapterId) || studyChapters[0];
  const isCompleted = progress.completedChapters.includes(activeChapterId);

  // Return corresponding icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert": return <ShieldAlert className="h-5 w-5" />;
      case "FileText": return <FileText className="h-5 w-5" />;
      case "Scale": return <Scale className="h-5 w-5" />;
      case "Store": return <Store className="h-5 w-5" />;
      case "Briefcase": return <Briefcase className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const handleToggleComplete = () => {
    onToggleChapterComplete(activeChapterId);
  };

  return (
    <div id="study-notes-root" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Chapter Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 hidden lg:block">학습 카테고리</h3>
        
        {/* Mobile Selector Dropdown */}
        <div className="lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">학습 카테고리 선택</label>
          <select
            value={activeChapterId}
            onChange={(e) => {
              setActiveChapterId(e.target.value);
              setExpandedSectionIdx(0);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {studyChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title} {progress.completedChapters.includes(chapter.id) ? " (완료)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block space-y-1.5">
          {studyChapters.map((chapter) => {
            const isActive = chapter.id === activeChapterId;
            const isChapDone = progress.completedChapters.includes(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => {
                  setActiveChapterId(chapter.id);
                  setExpandedSectionIdx(0);
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-1.5 ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {getIcon(chapter.icon)}
                  </div>
                  <span className="truncate max-w-[150px] lg:max-w-none">{chapter.title}</span>
                </div>
                {isChapDone && (
                  <span className={`flex items-center justify-center rounded-full p-0.5 ${isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Quick Call to action */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 mt-6 text-center space-y-2.5">
          <Sparkles className="h-5 w-5 text-indigo-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-900">법조문이 난해하신가요?</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            원사업자 의무, 점포 리뉴얼 분담금 조건 등 상세 판례를 AI 튜터에게 물어보세요.
          </p>
          <button 
            onClick={() => onTabChange("aitutor")}
            className="w-full py-1.5 text-xs font-bold text-indigo-700 hover:text-white border border-indigo-300 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
          >
            AI 법률 튜터 호출
          </button>
        </div>
      </div>

      {/* Chapter Content Main Area */}
      <div className="lg:col-span-3 space-y-6">
        <motion.div 
          key={activeChapterId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 tracking-wider">COMPREHENSIVE NOTE</span>
              <h2 className="text-2xl font-black text-slate-900 font-sans">{activeChapter.title}</h2>
            </div>
            
            {/* Complete toggle button */}
            <button
              onClick={handleToggleComplete}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                isCompleted 
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <Check className={`h-4 w-4 ${isCompleted ? "text-emerald-600" : "text-slate-400"}`} />
              {isCompleted ? "학습 완료함" : "학습 완료로 체크"}
            </button>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {activeChapter.sections.map((section, idx) => {
              const isExpanded = expandedSectionIdx === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-xl border transition-all ${
                    isExpanded 
                      ? "border-indigo-100 bg-indigo-50/10 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Section Accordion Trigger */}
                  <button
                    onClick={() => setExpandedSectionIdx(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 hover:text-indigo-600 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-mono text-indigo-500">0{idx + 1}.</span>
                      <span className="text-sm md:text-base">{section.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {/* Section Body */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 bg-white rounded-b-xl"
                      >
                        <div className="p-5 space-y-4 text-sm text-slate-600 leading-relaxed">
                          {section.subtitle && (
                            <div className="font-bold text-slate-900 text-xs tracking-wide uppercase bg-slate-50 px-2.5 py-1 rounded inline-block">
                              📌 {section.subtitle}
                            </div>
                          )}

                          <ul className="space-y-3">
                            {section.details.map((detail, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-2.5">
                                <span className="text-indigo-500 font-bold mt-1 shrink-0">•</span>
                                <span className="text-slate-700">{detail}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Key Tips Card */}
                          {section.tips && section.tips.length > 0 && (
                            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/40 p-4 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                                <Award className="h-4 w-4 text-amber-600" />
                                중요 빈출 수험 요령 (Exam Point)
                              </div>
                              <ul className="space-y-1 pl-1 text-xs text-amber-900">
                                {section.tips.map((tip, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-1">
                                    <span className="font-semibold text-amber-700 shrink-0">※</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Quick study quiz connection */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <span>방금 공부한 단원과 관련된 정형화된 기출 문제를 즉시 풀어보시겠습니까?</span>
            </div>
            <button
              onClick={() => onTabChange("quiz")}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline whitespace-nowrap cursor-pointer"
            >
              이 단원 퀴즈 풀기
              <HelpCircle className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
