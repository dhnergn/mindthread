export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type PrerequisiteLevel = 'Foundational' | 'Intermediate' | 'Deep Dive';

export interface UserQuestion {
  id: string;
  text: string;
  timestamp: string;
  timeOfDay: TimeOfDay;
  contextTag: string;
  domain: string;
  quickAnswer: string;
  keyConcepts: string[];
  prerequisiteLevel: PrerequisiteLevel;
  curiositySpark: string;
}

export interface InteractiveQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface VisualConceptItem {
  label: string;
  detail: string;
  highlight?: boolean;
}

export interface LessonContent {
  overview: string;
  mentalModel: {
    name: string;
    analogy: string;
    breakdown: string;
  };
  keyPrinciples: {
    title: string;
    explanation: string;
    practicalExample: string;
  }[];
  visualBreakdown?: {
    title: string;
    type: 'flow' | 'comparison' | 'hierarchy';
    items: VisualConceptItem[];
  };
  quizQuestions: InteractiveQuizQuestion[];
  flashcards: Flashcard[];
  nextRabbitHoles: string[];
}

export interface LearningUnit {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  status: 'not_started' | 'in_progress' | 'mastered';
  prerequisites: string[];
  sourceQuestionText: string;
  connectionReason: string;
  coreTakeaways: string[];
  lessonContent?: LessonContent;
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  thematicSynthesis: string;
  sourceQuestionIds: string[];
  units: LearningUnit[];
  estimatedMinutes: number;
  createdAt: string;
  dominantDomains: string[];
  synergyInsight: string;
}

export interface QuestionAnalysisResult {
  domain: string;
  quickAnswer: string;
  keyConcepts: string[];
  prerequisiteLevel: PrerequisiteLevel;
  curiositySpark: string;
}
