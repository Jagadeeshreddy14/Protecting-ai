export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string; // Base64 simulation
}

export enum QuestionType {
  MCQ = 'MCQ',
  SUBJECTIVE = 'SUBJECTIVE',
  PRACTICAL = 'PRACTICAL'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ auto-check
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  createdBy: string;
  negativeMarking: boolean;
  calculatorAllowed: boolean;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  maxScore: number;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  submittedAt: string;
  proctorLogs: ProctorLog[];
}

export interface ProctorLog {
  timestamp: string;
  type: 'TAB_SWITCH' | 'NO_FACE' | 'MULTIPLE_FACES' | 'AUDIO_DETECTED' | 'FULLSCREEN_EXIT' | 'COPY_PASTE_ATTEMPT' | 'GAZE_WARNING';
  message: string;
  snapshot?: string; // Base64 screenshot/webcam
}

export type ViewState = 
  | 'AUTH_LOGIN' 
  | 'AUTH_REGISTER' 
  | 'PROF_DASHBOARD' 
  | 'STUDENT_DASHBOARD' 
  | 'EXAM_RUNNER';

export interface AppState {
  view: ViewState;
  currentUser: User | null;
  activeExamId?: string;
}