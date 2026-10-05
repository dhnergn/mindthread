import { UserQuestion, LearningPath } from '../types';
import { SAMPLE_QUESTION_SETS } from '../data/sampleQuestions';

const QUESTIONS_KEY = 'mindthread_questions_v1';
const CURRENT_PATH_KEY = 'mindthread_current_path_v1';
const SAVED_PATHS_KEY = 'mindthread_saved_paths_v1';

export function getStoredQuestions(): UserQuestion[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      // Seed with initial sample questions so the user has immediate value
      const initialQuestions = generateSeedQuestions();
      saveQuestions(initialQuestions);
      return initialQuestions;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load questions from storage', e);
    return [];
  }
}

export function saveQuestions(questions: UserQuestion[]): void {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions to storage', e);
  }
}

export function getStoredCurrentPath(): LearningPath | null {
  try {
    const raw = localStorage.getItem(CURRENT_PATH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load current path', e);
    return null;
  }
}

export function saveCurrentPath(path: LearningPath | null): void {
  try {
    if (path) {
      localStorage.setItem(CURRENT_PATH_KEY, JSON.stringify(path));
      // Also add to saved paths list if not present
      const saved = getSavedPaths();
      const existingIdx = saved.findIndex(p => p.id === path.id);
      if (existingIdx >= 0) {
        saved[existingIdx] = path;
      } else {
        saved.unshift(path);
      }
      localStorage.setItem(SAVED_PATHS_KEY, JSON.stringify(saved));
    } else {
      localStorage.removeItem(CURRENT_PATH_KEY);
    }
  } catch (e) {
    console.error('Failed to save path', e);
  }
}

export function getSavedPaths(): LearningPath[] {
  try {
    const raw = localStorage.getItem(SAVED_PATHS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function generateSeedQuestions(): UserQuestion[] {
  const seed = SAMPLE_QUESTION_SETS[0];
  const now = Date.now();
  return seed.questions.map((q, idx) => ({
    id: `q_seed_${idx + 1}`,
    text: q.text || '',
    timestamp: new Date(now - (seed.questions.length - idx) * 3600 * 1000 * 2.5).toISOString(),
    timeOfDay: q.timeOfDay || 'afternoon',
    contextTag: q.contextTag || 'Everyday',
    domain: q.domain || 'General',
    quickAnswer: q.quickAnswer || '',
    keyConcepts: q.keyConcepts || [],
    prerequisiteLevel: q.prerequisiteLevel || 'Foundational',
    curiositySpark: q.curiositySpark || '',
  }));
}
