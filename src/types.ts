export interface QuizItem {
  id: string;
  chapterId: string;
  type: "multiple" | "ox";
  question: string;
  options: string[];
  answer: string | number;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  icon: string;
  sections: {
    title: string;
    subtitle?: string;
    details: string[];
    tips?: string[];
  }[];
}

export interface UserProgress {
  completedChapters: string[]; // 완수한 챕터 아이디 목록
  completedQuizzes: string[]; // 한 번이라도 풀어서 맞춘 퀴즈 아이디 목록
  mistakes: string[]; // 틀려서 오답노트에 보관된 퀴즈 아이디 목록
  mockHistory: {
    date: string;
    score: number;
    total: number;
    passed: boolean;
  }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}
