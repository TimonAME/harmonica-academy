export interface TabNote {
  hole: number;
  isDraw: boolean;
  isBend?: boolean;
  bendLevel?: number; // 1 = ', 2 = '', 3 = '''
  duration: number; // beats
  lyrics?: string;
  noteName?: string; // e.g. "C5"
  secondHole?: number;
}

export interface Song {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  key: string; // e.g., "C", "G", "A"
  category: "classic" | "blues" | "folk" | "pop";
  tempo: number; // BPM
  tabs: TabNote[];
}

export interface LessonStep {
  title: string;
  instruction: string;
  diagramType: "single-note" | "blow-draw" | "bending" | "tabs";
  targetHole?: number;
  targetIsDraw?: boolean;
  targetNote?: string;
  practiceTab?: TabNote[];
  audioExample?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: "easy" | "medium";
  icon: string;
  steps: LessonStep[];
}

export interface PracticeSession {
  date: string;
  songId: string;
  songTitle: string;
  durationSeconds: number;
  accuracy: number; // percentage
  pointsEarned: number;
}

export interface UserProgress {
  practiceTimeSeconds: number;
  streakDays: number;
  lastPracticeDate: string | null;
  completedLessons: string[]; // IDs
  masteredSongs: string[]; // IDs
  sessions: PracticeSession[];
  unlockedAchievements: string[]; // IDs
  totalPoints: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirementType: "streak" | "points" | "songs" | "lessons" | "accuracy";
  requirementValue: number;
}
