export interface Question {
  id: number;
  question: string;
  correct: string;
  wrong: string[];
  category?: string;
}

export interface Option {
  text: string;
  isCorrect: boolean;
  russianLabel: string;
}

export interface User {
  username: string;
  namaLengkap: string;
  isAdmin?: boolean;
}

export interface AnswerRecord {
  question: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
  category?: string;
}

export interface LeaderboardEntry {
  rank?: number;
  name: string;
  username: string;
  score: number;
  totalQuestions: number;
  timeSeconds: number;
  date: string;
  rowIndex?: number;
}

export type ViewMode = 'login' | 'dashboard' | 'quiz' | 'result' | 'leaderboard' | 'admin';

export interface AppConfig {
  gasWebAppUrl: string;
  soundEnabled: boolean;
}
