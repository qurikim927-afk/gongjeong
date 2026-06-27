import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Brain, 
  Bot, 
  User, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronRight,
  BrainCircuit,
  Info
} from "lucide-react";
import { studyChapters } from "../data/studyData";
import { ChatMessage, QuizItem } from "../types";

interface AITutorProps {
  onTabChange: (tab: string) => void;
}

export default function AITutor({ onTabChange }: AITutorProps) {
  const [subTab, setSubTab] = useState<"chat" | "quiz">("chat");

  // Chat States
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      content: "반갑습니다! 대한민국 공정거래 시험 대비 AI 법률 튜터입니다. ⚖️\n\n공정위 사건 처리 절차, 전속고발권, 가맹사업법상 필수품목 기준, 하도급 대금 지불 요건 등 대한민국 공정거래 분야의 모든 법률적 의문점에 대해 알기 쉽게 답변해 드립니다. 궁금한 사항을 자유롭게 물어보세요!",
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // AI Quiz States
  const [selectedTopicId, setSelectedTopicId] = useState<string>(studyChapters[0].id);
  const [isQuizGenerating, setIsQuizGenerating] = useState<boolean>(false);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<QuizItem[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string | number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [quizError, setQuizError] = useState<string | null>(null);

  // Auto Scroll Chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  // Handle Send Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Package messages list formatted for backend API
      const formattedMessages = [...chatMessages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!res.ok) throw new Error("AI 응답을 가져오지 못했습니다.");
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "model",
          content: data.text,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          content: "❌ 통신 오류가 발생했습니다. 환경설정에 API Key가 잘 등록되어 있는지 확인해주세요.",
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Generate Quiz
  const handleGenerateAIQuiz = async () => {
    setIsQuizGenerating(true);
    setQuizError(null);
    setGeneratedQuizzes([]);
    setQuizAnswers({});
    setQuizSubmitted({});

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopicId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.error === "NO_API_KEY") {
          throw new Error("API_KEY_MISSING");
        }
        throw new Error("AI 문제 생성 중 네트워크 이상이 생겼습니다.");
      }

      const data = await res.json();
      const quizzesWithIds = data.quizzes.map((quiz: any, idx: number) => ({
        id: `ai-gen-${Date.now()}-${idx}`,
        chapterId: selectedTopicId,
        type: quiz.type,
        question: quiz.question,
        options: quiz.options,
        answer: quiz.answer,
        explanation: quiz.explanation,
      }));

      setGeneratedQuizzes(quizzesWithIds);
    } catch (err: any) {
      if (err.message === "API_KEY_MISSING") {
        setQuizError("💡 실시간 AI 기출 생성은 우측 상단 **Settings > Secrets**에 실물 `GEMINI_API_KEY`를 등록해야 완벽히 가동됩니다! API Key를 채운 뒤 다시 버튼을 눌러주세요.");
      } else {
        setQuizError(err.message || "문제를 가져오는 중 에러가 발생했습니다.");
      }
    } finally {
      setIsQuizGenerating(false);
    }
  };

  const handleSelectQuizAnswer = (qIdx: number, val: string | number) => {
    if (quizSubmitted[qIdx]) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const handleSubmitQuizAnswer = (qIdx: number) => {
    if (quizAnswers[qIdx] === undefined) return;
    setQuizSubmitted((prev) => ({ ...prev, [qIdx]: true }));
  };

  return (
    <div id="ai-tutor-root" className="space-y-6">
      {/* Upper sub tab selectors */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab("chat")}
          className={`px-5 py-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "chat" 
              ? "border-purple-600 text-purple-700 font-extrabold" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          AI 1:1 법률 챗봇
        </button>
        <button
          onClick={() => setSubTab("quiz")}
          className={`px-5 py-3 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "quiz" 
              ? "border-purple-600 text-purple-700 font-extrabold" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BrainCircuit className="h-4.5 w-4.5" />
          AI 실시간 기출 생성기
        </button>
      </div>

      {subTab === "chat" ? (
        /* Chat sub tab */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left panel chat instructions */}
          <div className="hidden lg:block lg:col-span-1 rounded-xl border border-purple-100 bg-purple-50/25 p-5 space-y-4">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI 튜터 사용 요령
            </div>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span>'정보공개서 14일 전 제공의무 예외' 처럼 구체적인 세부 조항을 질문해보세요.</span>
              </li>
              <li className="flex gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span>'가맹사업법상 필수품목 구속의 위법 요건이 무엇이지?' 등 판례 중심 해석도 명쾌히 답합니다.</span>
              </li>
              <li className="flex gap-1.5">
                <span className="text-purple-600 font-bold">•</span>
                <span>공부하다가 난해하고 와닿지 않는 한자어 법률용어를 쉬운 한글 예시로 풀어달라고 요청해 보세요.</span>
              </li>
            </ul>

            <div className="rounded-lg bg-white border border-purple-100 p-3 text-[10px] text-slate-500 leading-normal flex gap-1.5">
              <Info className="h-4 w-4 text-slate-400 shrink-0" />
              <span>본 튜터는 제공된 공정위 가이드 핵심 노트를 최우선 정답 근거로 삼아 수험에 철저히 최적화되어 답변합니다.</span>
            </div>
          </div>

          {/* Right panel interactive chat window */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[550px] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center gap-2.5">
              <div className="rounded-full bg-purple-600/30 p-1.5 text-purple-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold block">공정거래법 전문 법률 튜터</span>
                <span className="text-[10px] text-emerald-400 font-bold">● 실시간 온라인 튜터링</span>
              </div>
            </div>

            {/* Chat Messages flow area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {chatMessages.map((msg) => {
                const isAI = msg.role === "model";
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isAI ? "justify-start" : "justify-end"}`}>
                    {isAI && (
                      <div className="rounded-full bg-purple-100 p-1.5 text-purple-700 shrink-0 mt-1">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                    )}
                    
                    <div className="max-w-[80%] space-y-1">
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        isAI 
                          ? "bg-white text-slate-800 border border-slate-200 shadow-sm" 
                          : "bg-purple-600 text-white"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="block text-[9px] text-slate-400 text-right">{msg.timestamp}</span>
                    </div>

                    {!isAI && (
                      <div className="rounded-full bg-slate-200 p-1.5 text-slate-600 shrink-0 mt-1">
                        <User className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="rounded-full bg-purple-100 p-1.5 text-purple-700 shrink-0 mt-1 animate-bounce">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-400 shadow-sm inline-flex items-center gap-1.5 font-bold font-mono">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    AI 튜터가 교안 및 법조문을 탐색하는 중...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendChat} className="p-3.5 border-t border-slate-200 flex gap-2 bg-white">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="공정거래법에 관해 궁금한 점을 편하게 질문해 보세요..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-purple-500 focus:bg-white transition-all text-slate-800"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white p-2.5 transition-colors cursor-pointer flex items-center justify-center disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* AI Quiz Generation sub tab */
        <div className="space-y-6">
          <div className="rounded-2xl border border-purple-100 bg-purple-50/10 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="max-w-xl space-y-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI가 출제하는 실시간 족집게 퀴즈
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                공부하고 싶은 특정 단원 분야를 선택하면, AI가 최신 기출 판례와 법조문을 결합하여 난이도 높은 맞춤형 예상 퀴즈 3문항을 실시간으로 무한 생성하여 제공합니다!
              </p>
            </div>

            {/* Selector and Generator Button */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                {studyChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>

              <button
                disabled={isQuizGenerating}
                onClick={handleGenerateAIQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:from-slate-400 disabled:to-slate-500"
              >
                {isQuizGenerating ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    새로운 AI 기출 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" />
                    3문항 출제하기 (실시간)
                  </>
                )}
              </button>
            </div>

            {/* Error display if any */}
            {quizError && (
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-xs text-rose-800 leading-relaxed max-w-2xl font-semibold">
                {quizError}
              </div>
            )}
          </div>

          {/* Generated Quiz list render */}
          {generatedQuizzes.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pl-1">
                <BrainCircuit className="h-4.5 w-4.5 text-purple-600" />
                생성 완료된 AI 기출 예상 문제
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generatedQuizzes.map((quiz, qIdx) => {
                  const currentAns = quizAnswers[qIdx];
                  const submitted = quizSubmitted[qIdx];
                  const isCorrect = String(currentAns) === String(quiz.answer);

                  return (
                    <div key={quiz.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>QUESTION 0{qIdx + 1}</span>
                          <span>{quiz.type === "ox" ? "OX 판정" : "4지선다형"}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
                          {quiz.question}
                        </p>

                        {/* Options Render */}
                        <div className="space-y-1.5 pt-2">
                          {quiz.options.map((option, idx) => {
                            const isOX = quiz.type === "ox";
                            const optionVal = isOX ? option : idx;
                            const isSelected = currentAns !== undefined && String(currentAns) === String(optionVal);

                            let optionStyle = "border-slate-100 hover:bg-slate-50 bg-slate-50/50 text-slate-700";

                            if (submitted) {
                              const correctAnsValue = String(optionVal) === String(quiz.answer);
                              if (correctAnsValue) {
                                optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                              } else if (isSelected) {
                                optionStyle = "border-rose-500 bg-rose-50 text-rose-900";
                              }
                            } else if (isSelected) {
                              optionStyle = "border-purple-500 bg-purple-50 text-purple-950 font-semibold";
                            }

                            return (
                              <button
                                key={idx}
                                disabled={submitted}
                                onClick={() => handleSelectQuizAnswer(qIdx, optionVal)}
                                className={`w-full text-left p-2.5 rounded-lg border text-[11px] transition-all cursor-pointer ${optionStyle}`}
                              >
                                <span className="font-mono text-slate-400 mr-2">
                                  {isOX ? (idx === 0 ? "O" : "X") : `${idx + 1}`}
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation and action footer */}
                      <div className="pt-3 border-t border-slate-100 mt-4 space-y-2">
                        {!submitted ? (
                          <button
                            disabled={currentAns === undefined}
                            onClick={() => handleSubmitQuizAnswer(qIdx)}
                            className="w-full py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold transition-all cursor-pointer"
                          >
                            정답 제출하기
                          </button>
                        ) : (
                          <div className={`rounded-lg p-3 text-[11px] leading-relaxed space-y-1.5 ${
                            isCorrect ? "bg-emerald-50/40 text-emerald-950 border border-emerald-100" : "bg-rose-50/40 text-rose-950 border border-rose-100"
                          }`}>
                            <div className="flex items-center gap-1 font-bold">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>정답입니다!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-rose-600" />
                                  <span>오답입니다!</span>
                                </>
                              )}
                            </div>
                            <p className="text-slate-600 font-normal">
                              <span className="font-bold text-slate-800">해설:</span> {quiz.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
