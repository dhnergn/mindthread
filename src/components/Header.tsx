import React from 'react';
import { Compass, BookOpen, Network, Layers, Sparkles, PlusCircle } from 'lucide-react';
import { LearningPath, UserQuestion } from '../types';

interface HeaderProps {
  currentTab: 'questions' | 'curriculum' | 'graph' | 'flashcards';
  setCurrentTab: (tab: 'questions' | 'curriculum' | 'graph' | 'flashcards') => void;
  questions: UserQuestion[];
  currentPath: LearningPath | null;
  onSynthesize: () => void;
  isSynthesizing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  questions,
  currentPath,
  onSynthesize,
  isSynthesizing,
}) => {
  const masteredUnits = currentPath?.units.filter((u) => u.status === 'mastered').length || 0;
  const totalUnits = currentPath?.units.length || 0;

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-stone-900">MindThread</span>
                <span className="text-[11px] text-stone-700 font-medium">Curiosity Engine</span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Questions asked throughout your day woven into personalized learning paths
              </p>
            </div>
          </div>

          {/* Action & Stats */}
          <div className="flex items-center gap-2.5 sm:gap-4 self-end sm:self-auto">
            {questions.length > 0 && (
              <div className="hidden md:flex items-center gap-3 text-xs text-stone-500 border-r border-stone-200 pr-4">
                <div>
                  <span className="font-semibold text-stone-800">{questions.length}</span> questions
                </div>
                <span>·</span>
                {totalUnits > 0 ? (
                  <div>
                    <span className="font-semibold text-stone-800">
                      {masteredUnits}/{totalUnits}
                    </span>{' '}
                    units mastered
                  </div>
                ) : (
                  <span className="text-stone-400">Ready to synthesize</span>
                )}
              </div>
            )}

            <button
              onClick={onSynthesize}
              disabled={isSynthesizing || questions.length === 0}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
                questions.length === 0
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-100 active:scale-[0.98]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Synthesizing Path...' : currentPath ? 'Re-Synthesize Path' : 'Synthesize Learning Path'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-100 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setCurrentTab('questions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'questions'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Daily Inquiries</span>
            <span className="ml-1 text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
              {questions.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('curriculum')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'curriculum'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learning Roadmap</span>
            {currentPath && (
              <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                {currentPath.units.length} units
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'graph'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Knowledge Web</span>
          </button>

          <button
            onClick={() => setCurrentTab('flashcards')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              currentTab === 'flashcards'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recall Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
