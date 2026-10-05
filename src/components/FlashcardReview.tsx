import React, { useState, useMemo } from 'react';
import { Layers, RotateCw, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { LearningPath, UserQuestion } from '../types';

interface FlashcardReviewProps {
  currentPath: LearningPath | null;
  questions: UserQuestion[];
  onOpenRoadmap: () => void;
}

interface DeckCard {
  front: string;
  back: string;
  sourceUnitOrQuestion: string;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  currentPath,
  questions,
  onOpenRoadmap,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Aggregate flashcards from all units with generated lessons, or derive from questions
  const deck = useMemo<DeckCard[]>(() => {
    const cards: DeckCard[] = [];

    if (currentPath) {
      currentPath.units.forEach((unit) => {
        if (unit.lessonContent?.flashcards) {
          unit.lessonContent.flashcards.forEach((fc) => {
            cards.push({
              front: fc.front,
              back: fc.back,
              sourceUnitOrQuestion: `Unit 0${unit.order}: ${unit.title}`,
            });
          });
        }
      });
    }

    // If no lessons generated yet, fallback to cards generated from the logged questions
    if (cards.length === 0 && questions.length > 0) {
      questions.forEach((q) => {
        cards.push({
          front: q.text,
          back: q.quickAnswer,
          sourceUnitOrQuestion: `${q.domain} · Question Inquiry`,
        });
        if (q.keyConcepts.length > 0) {
          cards.push({
            front: `What core principles govern "${q.keyConcepts.slice(0, 2).join(' and ')}"?`,
            back: `In the context of ${q.domain}: ${q.curiositySpark || q.quickAnswer}`,
            sourceUnitOrQuestion: `${q.domain} · Concept`,
          });
        }
      });
    }

    return cards;
  }, [currentPath, questions]);

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < deck.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deck.length - 1));
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (deck.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-xs">
        <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-stone-900">Recall Studio Deck is Empty</h4>
        <p className="text-xs text-stone-500 mt-1 mb-5">
          Log questions in Daily Inquiries or synthesize a learning path to unlock spaced-repetition flashcards.
        </p>
        <button
          onClick={onOpenRoadmap}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
        >
          View Learning Roadmap
        </button>
      </div>
    );
  }

  const isCurrentMastered = masteredCards.has(currentIndex);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-stone-900">
            Active Recall Studio
          </h3>
          <p className="text-xs text-stone-500">
            Spaced retrieval practice distilled from your questions and course units.
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg">
          {masteredCards.size} / {deck.length} Mastered
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="space-y-4">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`min-h-[260px] sm:min-h-[300px] bg-white border-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center cursor-pointer transition-all shadow-sm select-none ${
            isFlipped
              ? 'border-amber-400 bg-amber-50/20'
              : 'border-stone-200 hover:border-stone-400'
          }`}
        >
          {/* Card Header Meta */}
          <div className="w-full flex items-center justify-between text-[11px] text-stone-400">
            <span className="font-medium text-stone-600 truncate max-w-xs">
              {currentCard?.sourceUnitOrQuestion}
            </span>
            <span className="font-mono">
              Card {currentIndex + 1} of {deck.length}
            </span>
          </div>

          {/* Card Body */}
          <div className="my-auto text-center max-w-lg">
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              {isFlipped ? 'Answer & Core Principle' : 'Prompt / Concept Question'}
            </div>
            <p
              className={`text-base sm:text-xl font-semibold leading-relaxed ${
                isFlipped ? 'text-amber-950' : 'text-stone-900'
              }`}
            >
              {isFlipped ? currentCard?.back : currentCard?.front}
            </p>
          </div>

          {/* Footer instruction */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click anywhere to flip</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => toggleMastered(currentIndex)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isCurrentMastered
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCurrentMastered ? 'Mastered' : 'Mark as Mastered'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
