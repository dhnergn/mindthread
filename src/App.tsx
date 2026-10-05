/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuestionCapture } from './components/QuestionCapture';
import { LearningPathView } from './components/LearningPathView';
import { LessonModal } from './components/LessonModal';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { FlashcardReview } from './components/FlashcardReview';
import { UserQuestion, LearningPath, LearningUnit } from './types';
import {
  getStoredQuestions,
  saveQuestions,
  getStoredCurrentPath,
  saveCurrentPath,
} from './utils/storage';
import { generateLearningPath, analyzeQuestion } from './utils/api';
import { SAMPLE_QUESTION_SETS } from './data/sampleQuestions';
import { Check, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [currentTab, setCurrentTab] = useState<'questions' | 'curriculum' | 'graph' | 'flashcards'>('questions');
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedQuestions = getStoredQuestions();
    setQuestions(loadedQuestions);
    const loadedPath = getStoredCurrentPath();
    setCurrentPath(loadedPath);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddQuestion = (q: UserQuestion) => {
    const updated = [q, ...questions];
    setQuestions(updated);
    saveQuestions(updated);
    showToast(`Logged inquiry: "${q.text.slice(0, 38)}..."`);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleClearQuestions = () => {
    if (window.confirm('Clear all inquiries and reset the current learning path?')) {
      setQuestions([]);
      saveQuestions([]);
      setCurrentPath(null);
      saveCurrentPath(null);
      showToast('All inquiries cleared.');
    }
  };

  const handleLoadPreset = (presetIndex: number) => {
    const preset = SAMPLE_QUESTION_SETS[presetIndex];
    if (!preset) return;

    const now = Date.now();
    const newQuestions: UserQuestion[] = preset.questions.map((q, idx) => ({
      id: `q_preset_${presetIndex}_${idx}_${now}`,
      text: q.text || '',
      timestamp: new Date(now - (preset.questions.length - idx) * 3600 * 1000 * 2).toISOString(),
      timeOfDay: q.timeOfDay || 'afternoon',
      contextTag: q.contextTag || 'Everyday',
      domain: q.domain || 'General',
      quickAnswer: q.quickAnswer || '',
      keyConcepts: q.keyConcepts || [],
      prerequisiteLevel: q.prerequisiteLevel || 'Foundational',
      curiositySpark: q.curiositySpark || '',
    }));

    setQuestions(newQuestions);
    saveQuestions(newQuestions);
    showToast(`Loaded ${preset.name} (${newQuestions.length} questions).`);
  };

  const handleSynthesizePath = async () => {
    if (questions.length === 0 || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const path = await generateLearningPath(questions);
      setCurrentPath(path);
      saveCurrentPath(path);
      setCurrentTab('curriculum');
      showToast('Learning path synthesized from your questions!');
    } catch (err: any) {
      console.error('Synthesis error', err);
      showToast('Failed to synthesize path. Please check your connection.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleUpdateUnit = (updatedUnit: LearningUnit) => {
    if (!currentPath) return;

    const updatedUnits = currentPath.units.map((u) =>
      u.id === updatedUnit.id ? updatedUnit : u
    );

    const updatedPath = { ...currentPath, units: updatedUnits };
    setCurrentPath(updatedPath);
    saveCurrentPath(updatedPath);

    if (selectedUnit && selectedUnit.id === updatedUnit.id) {
      setSelectedUnit(updatedUnit);
    }
  };

  const handleAddFollowUpQuestion = async (questionText: string) => {
    try {
      const analysis = await analyzeQuestion(questionText, 'Follow-up Inquiry', 'afternoon');
      const newQ: UserQuestion = {
        id: 'q_followup_' + Date.now(),
        text: questionText,
        timestamp: new Date().toISOString(),
        timeOfDay: 'afternoon',
        contextTag: 'Rabbit Hole / Deep Dive',
        domain: analysis.domain || 'Inquiry',
        quickAnswer: analysis.quickAnswer || '',
        keyConcepts: analysis.keyConcepts || [],
        prerequisiteLevel: analysis.prerequisiteLevel || 'Intermediate',
        curiositySpark: analysis.curiositySpark || '',
      };

      handleAddQuestion(newQ);
      showToast('Rabbit hole added to your inquiry stream!');
    } catch (e) {
      console.error('Error adding follow up', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        questions={questions}
        currentPath={currentPath}
        onSynthesize={handleSynthesizePath}
        isSynthesizing={isSynthesizing}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'questions' && (
          <QuestionCapture
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onClearQuestions={handleClearQuestions}
            onLoadPreset={handleLoadPreset}
            onSynthesize={handleSynthesizePath}
            isSynthesizing={isSynthesizing}
          />
        )}

        {currentTab === 'curriculum' && (
          <LearningPathView
            currentPath={currentPath}
            onSelectUnit={(unit) => setSelectedUnit(unit)}
            onSynthesize={handleSynthesizePath}
            isSynthesizing={isSynthesizing}
            questionCount={questions.length}
          />
        )}

        {currentTab === 'graph' && (
          <KnowledgeGraph
            questions={questions}
            currentPath={currentPath}
            onSelectUnit={(unit) => {
              setSelectedUnit(unit);
            }}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardReview
            currentPath={currentPath}
            questions={questions}
            onOpenRoadmap={() => setCurrentTab('curriculum')}
          />
        )}
      </main>

      {/* Interactive Lesson Studio Modal */}
      {selectedUnit && (
        <LessonModal
          unit={selectedUnit}
          pathTitle={currentPath?.title || 'Personalized Inquiry'}
          userQuestions={questions}
          onClose={() => setSelectedUnit(null)}
          onUpdateUnit={handleUpdateUnit}
          onAddFollowUpQuestion={handleAddFollowUpQuestion}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>MindThread · Epistemic Synthesis & Daily Learning Path Engine</div>
          <div>Turning every moment of curiosity into structured mastery</div>
        </div>
      </footer>
    </div>
  );
}
