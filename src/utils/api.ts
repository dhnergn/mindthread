import { UserQuestion, LearningPath, LearningUnit, LessonContent, QuestionAnalysisResult } from '../types';

export async function analyzeQuestion(
  text: string,
  contextTag: string,
  timeOfDay: string
): Promise<QuestionAnalysisResult> {
  const res = await fetch('/api/analyze-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, contextTag, timeOfDay }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (errData.fallback) {
      return errData.fallback;
    }
    throw new Error(errData.error || 'Failed to analyze question');
  }

  return await res.json();
}

export async function generateLearningPath(
  questions: UserQuestion[],
  focusDomain?: string
): Promise<LearningPath> {
  const res = await fetch('/api/generate-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions, focusDomain }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to synthesize learning path');
  }

  return await res.json();
}

export async function generateLessonContent(
  unit: LearningUnit,
  pathTitle: string,
  userQuestions: UserQuestion[]
): Promise<LessonContent> {
  const res = await fetch('/api/generate-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unit, pathTitle, userQuestions }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to generate unit lesson');
  }

  return await res.json();
}

export async function fetchAudioNarration(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/audio-narration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.audioBase64) {
      return `data:audio/wav;base64,${data.audioBase64}`;
    }
    return null;
  } catch (e) {
    console.warn('TTS narration error, falling back', e);
    return null;
  }
}
