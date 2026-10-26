export type CognitiveLevel = 'recognition' | 'comprehension' | 'application' | 'advanced_application';

export const COGNITIVE_LEVEL_LABELS: Record<CognitiveLevel, string> = {
  recognition: 'Nhận biết',
  comprehension: 'Thông hiểu',
  application: 'Vận dụng',
  advanced_application: 'Vận dụng cao',
};

export const COGNITIVE_LEVEL_COLORS: Record<CognitiveLevel, string> = {
  recognition: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  comprehension: 'bg-blue-100 text-blue-800 border-blue-300',
  application: 'bg-amber-100 text-amber-800 border-amber-300',
  advanced_application: 'bg-rose-100 text-rose-800 border-rose-300',
};

export interface QuestionPart1Config {
  number: number;
  part: 1;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  maxScore: number;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface QuestionPart2Config {
  number: number;
  part: 2;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  maxScore: number; // usually 1.0 (BGD scale: 0.1 - 0.25 - 0.5 - 1.0)
  correctAnswer: {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
  };
}

export interface QuestionPart3Config {
  number: number;
  part: 3;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  maxScore: number; // e.g. 0.5
  correctAnswer: string; // e.g. "12.5", "-4", "0.75"
}

export type ExamQuestion = QuestionPart1Config | QuestionPart2Config | QuestionPart3Config;

export interface ExamMatrixItem {
  topic: string;
  recognitionCount: number;
  comprehensionCount: number;
  applicationCount: number;
  advancedCount: number;
  totalScore: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: number; // 10, 11, 12
  academicYear: string;
  durationMinutes: number;
  totalScore: number; // 10.0
  codes: string[]; // e.g. ["101", "102"]
  questionsByCode: Record<string, ExamQuestion[]>;
  matrix: ExamMatrixItem[];
  scoringRuleDescription: string;
}

export interface Student {
  id: string;
  sbd: string; // 6 digits, e.g. "010201"
  name: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  email?: string;
  phone?: string;
}

export interface QuestionGradeResult {
  questionNumber: number;
  part: 1 | 2 | 3;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  studentAnswer: any;
  correctAnswer: any;
  scoreEarned: number;
  maxScore: number;
  isCorrect: boolean | 'partial';
  details?: string;
}

export interface TopicCompetencyResult {
  topic: string;
  totalQuestions: number;
  correctCount: number;
  scoreEarned: number;
  maxScore: number;
  percentage: number;
}

export interface LevelCompetencyResult {
  level: CognitiveLevel;
  label: string;
  totalQuestions: number;
  correctCount: number;
  scoreEarned: number;
  maxScore: number;
  percentage: number;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  sbd: string;
  examCode: string;
  studentName: string;
  className: string;
  scannedAt: string;
  imagePreviewUrl?: string;
  rawAnswers: {
    part1: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
    part2: Record<number, { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null }>;
    part3: Record<number, string | null>;
  };
  scores: {
    part1Score: number;
    part2Score: number;
    part3Score: number;
    totalScore: number;
  };
  questionResults: QuestionGradeResult[];
  topicCompetencies: Record<string, TopicCompetencyResult>;
  levelCompetencies: Record<CognitiveLevel, LevelCompetencyResult>;
  scanNotes?: string[];
  teacherFeedback?: string;
  aiPedagogicalAdvice?: string;
}
