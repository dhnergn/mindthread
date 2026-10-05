import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Plus,
  RefreshCw,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { LearningUnit, LessonContent, UserQuestion } from '../types';
import { generateLessonContent, fetchAudioNarration } from '../utils/api';

interface LessonModalProps {
  unit: LearningUnit;
  pathTitle: string;
  userQuestions: UserQuestion[];
  onClose: () => void;
  onUpdateUnit: (updatedUnit: LearningUnit) => void;
  onAddFollowUpQuestion: (questionText: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  unit,
  pathTitle,
  userQuestions,
  onClose,
  onUpdateUnit,
  onAddFollowUpQuestion,
}) => {
  const [lesson, setLesson] = useState<LessonContent | null>(unit.lessonContent || null);
  const [loading, setLoading] = useState(!unit.lessonContent);
  const [error, setError] = useState<string | null>(null);

  // Active view tab in the studio: 'lesson' | 'quiz' | 'flashcards' | 'rabbitholes'
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'flashcards' | 'rabbitholes'>('lesson');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [showExplanations, setShowExplanations] = useState<{ [qIdx: number]: boolean }>({});

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Audio TTS state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Added rabbit holes tracker
  const [addedHoles, setAddedHoles] = useState<{ [idx: number]: boolean }>({});

  // Fetch lesson content if not cached
  useEffect(() => {
    let isMounted = true;
    if (!unit.lessonContent) {
      setLoading(true);
      setError(null);
      generateLessonContent(unit, pathTitle, userQuestions)
        .then((data) => {
          if (isMounted) {
            setLesson(data);
            const updated = {
              ...unit,
              status: unit.status === 'not_started' ? ('in_progress' as const) : unit.status,
              lessonContent: data,
            };
            onUpdateUnit(updated);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('Lesson generation error', err);
            setError(err.message || 'Failed to synthesize lesson.');
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [unit.id]);

  // Handle Audio Narration via Gemini 3.8 Flash Lite TTS
  const handleToggleAudio = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
      return;
    }

    if (!lesson) return;

    setIsLoadingAudio(true);
    // Create a concise narration script from overview and mental model
    const script = `${unit.title}. ${unit.subtitle}. ${lesson.overview.slice(0, 400)}. Key mental model: ${lesson.mentalModel.name}. ${lesson.mentalModel.analogy}.`;

    try {
      const url = await fetchAudioNarration(script);
      if (url) {
        setAudioUrl(url);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
        setIsPlayingAudio(true);
      } else {
        // Fallback to browser SpeechSynthesis if TTS fails
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(script);
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
          setIsPlayingAudio(true);
        }
      }
    } catch (e) {
      console.error('Audio narration failed', e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanations((prev) => ({ ...prev, [qIdx]: true }));
  };

  const handleToggleMastered = () => {
    const newStatus = unit.status === 'mastered' ? 'in_progress' : 'mastered';
    onUpdateUnit({ ...unit, status: newStatus });
  };

  const handleAddRabbitHole = (questionText: string, idx: number) => {
    onAddFollowUpQuestion(questionText);
    setAddedHoles((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-800">Unit 0{unit.order}</span>
              <span aria-hidden="true">·</span>
              <span>{unit.estimatedMinutes} mins</span>
              <span aria-hidden="true">·</span>
              <span className="italic text-stone-600">Origin: "{unit.sourceQuestionText}"</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 line-clamp-1">
              {unit.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Listen Button */}
            {lesson && (
              <button
                onClick={handleToggleAudio}
                disabled={isLoadingAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isPlayingAudio
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
                title="Listen to audio overview with Gemini TTS"
              >
                {isLoadingAudio ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isPlayingAudio ? (
                  <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-stone-600" />
                )}
                <span>{isLoadingAudio ? 'Loading...' : isPlayingAudio ? 'Pause' : 'Listen'}</span>
              </button>
            )}

            {/* Mastered toggle */}
            <button
              onClick={handleToggleMastered}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                unit.status === 'mastered'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{unit.status === 'mastered' ? 'Mastered' : 'Mark Mastered'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-stone-100 bg-white text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'lesson'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Lesson</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'quiz'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Check</span>
            {lesson && (
              <span className="text-[10px] opacity-80">({lesson.quizQuestions.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Recall</span>
            {lesson && (
              <span className="text-[10px] opacity-80">({lesson.flashcards.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rabbitholes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'rabbitholes'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rabbit Holes</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-stone-900 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-stone-800">
                  Synthesizing Deep-Dive Micro Lesson
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Gemini is constructing mental models, practical examples, interactive quiz items, and active recall cards for "{unit.title}"...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
              <p className="text-sm text-rose-800 font-medium">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  generateLessonContent(unit, pathTitle, userQuestions)
                    .then((d) => {
                      setLesson(d);
                      setLoading(false);
                    })
                    .catch((e) => {
                      setError(e.message);
                      setLoading(false);
                    });
                }}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                Retry Synthesis
              </button>
            </div>
          ) : lesson ? (
            <>
              {/* TAB 1: LESSON */}
              {activeTab === 'lesson' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  {/* Subtitle & Origin reminder */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                      Inquiry Foundation
                    </div>
                    <p className="text-sm font-medium text-stone-800 leading-snug">
                      "{unit.sourceQuestionText}"
                    </p>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {unit.connectionReason}
                    </p>
                  </div>

                  {/* Overview */}
                  <section className="space-y-3">
                    <h4 className="text-base font-bold text-stone-900 tracking-tight">
                      1. The Core Intuition
                    </h4>
                    <div className="text-sm text-stone-700 leading-relaxed space-y-3">
                      {lesson.overview.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </section>

                  {/* Mental Model Callout */}
                  <section className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Mental Model: {lesson.mentalModel.name}</span>
                    </div>

                    <div className="bg-white/80 rounded-xl p-3.5 border border-amber-200/60">
                      <span className="text-xs font-semibold text-amber-950">The Analogy: </span>
                      <span className="text-xs text-amber-900 italic">
                        "{lesson.mentalModel.analogy}"
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
                      {lesson.mentalModel.breakdown}
                    </p>
                  </section>

                  {/* Key Principles */}
                  <section className="space-y-4">
                    <h4 className="text-base font-bold text-stone-900 tracking-tight">
                      2. Foundational Principles & Real-World Mechanics
                    </h4>

                    <div className="grid gap-3.5">
                      {lesson.keyPrinciples.map((principle, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <h5 className="font-semibold text-stone-900 text-sm">
                              {principle.title}
                            </h5>
                          </div>

                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                            {principle.explanation}
                          </p>

                          <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                            <span className="font-semibold text-stone-700">Real-World Case: </span>
                            {principle.practicalExample}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Visual Concept Breakdown */}
                  {lesson.visualBreakdown && (
                    <section className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        <Layers className="w-4 h-4" />
                        <span>Visual Breakdown · {lesson.visualBreakdown.title}</span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        {lesson.visualBreakdown.items.map((item, vIdx) => (
                          <div
                            key={vIdx}
                            className={`rounded-xl p-3.5 border ${
                              item.highlight
                                ? 'bg-stone-800/90 border-amber-400/60'
                                : 'bg-stone-800/50 border-stone-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-mono text-amber-400">
                                0{vIdx + 1}
                              </span>
                              <h6 className="font-semibold text-xs text-white">
                                {item.label}
                              </h6>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed font-normal">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Bottom Navigation CTA */}
                  <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      Finished reading? Test your understanding with the micro-quiz.
                    </span>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                    >
                      <span>Take Micro-Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MICRO-QUIZ */}
              {activeTab === 'quiz' && (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-bold text-stone-900 tracking-tight">
                      Knowledge Verification
                    </h4>
                    <p className="text-xs text-stone-500">
                      Answer these conceptual questions to solidify your intuition for "{unit.title}".
                    </p>
                  </div>

                  <div className="space-y-6">
                    {lesson.quizQuestions.map((q, qIdx) => {
                      const userChoice = selectedAnswers[qIdx];
                      const isAnswered = userChoice !== undefined;
                      const isCorrect = userChoice === q.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <h5 className="font-semibold text-stone-900 text-sm leading-snug">
                              {q.question}
                            </h5>
                          </div>

                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = userChoice === optIdx;
                              const isThisCorrect = optIdx === q.correctIndex;

                              let optStyle = 'border-stone-200 hover:border-stone-400 bg-stone-50/50';
                              if (isAnswered) {
                                if (isThisCorrect) {
                                  optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                                } else if (isSelected) {
                                  optStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                                } else {
                                  optStyle = 'border-stone-100 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyle}`}
                                >
                                  <span>{option}</span>
                                  {isAnswered && isThisCorrect && (
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {showExplanations[qIdx] && (
                            <div
                              className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                                isCorrect
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                                  : 'bg-stone-50 border border-stone-200 text-stone-800'
                              }`}
                            >
                              <span className="font-bold">
                                {isCorrect ? 'Correct! ' : 'Explanation: '}
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('lesson')}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-700 hover:bg-stone-50 font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Lesson</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
                    >
                      <span>Review Flashcards</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVE RECALL FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6 max-w-xl mx-auto py-4 text-center">
                  <div>
                    <h4 className="text-lg font-bold text-stone-900 tracking-tight">
                      Active Recall Flashcards
                    </h4>
                    <p className="text-xs text-stone-500">
                      Card {currentCardIndex + 1} of {lesson.flashcards.length}
                    </p>
                  </div>

                  {lesson.flashcards[currentCardIndex] && (
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="min-h-[220px] sm:min-h-[260px] bg-white border-2 border-stone-200 hover:border-stone-400 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center cursor-pointer transition-all shadow-sm select-none"
                    >
                      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
                        {isFlipped ? 'The Principle / Answer' : 'Question / Key Term'}
                      </div>

                      <div className="my-auto max-w-md">
                        <p
                          className={`text-base sm:text-lg font-semibold leading-relaxed ${
                            isFlipped ? 'text-amber-900' : 'text-stone-900'
                          }`}
                        >
                          {isFlipped
                            ? lesson.flashcards[currentCardIndex].back
                            : lesson.flashcards[currentCardIndex].front}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Click card to flip</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) =>
                          prev > 0 ? prev - 1 : lesson.flashcards.length - 1
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium"
                    >
                      Flip Card
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) =>
                          prev < lesson.flashcards.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: RABBIT HOLES */}
              {activeTab === 'rabbitholes' && (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Curiosity Expansion</span>
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 tracking-tight">
                      Follow-Up Inquiries & Rabbit Holes
                    </h4>
                    <p className="text-xs text-stone-500">
                      Great inquiries lead to deeper mysteries. Click any question below to add it directly to today's inquiry stream.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {lesson.nextRabbitHoles.map((hole, idx) => {
                      const isAdded = addedHoles[idx];
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-400">
                              Rabbit Hole 0{idx + 1}
                            </span>
                            <p className="text-sm font-semibold text-stone-900">
                              "{hole}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddRabbitHole(hole, idx)}
                            disabled={isAdded}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                              isAdded
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-900 hover:bg-stone-800 text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Logged</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to My Questions</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 text-center">
                    <button
                      onClick={handleToggleMastered}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      {unit.status === 'mastered'
                        ? 'Unit Mastered ✓'
                        : 'Complete & Mark Unit as Mastered'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
