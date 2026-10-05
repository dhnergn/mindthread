import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { UserQuestion, TimeOfDay } from '../types';
import { analyzeQuestion } from '../utils/api';
import { SAMPLE_QUESTION_SETS } from '../data/sampleQuestions';

interface QuestionCaptureProps {
  questions: UserQuestion[];
  onAddQuestion: (q: UserQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onClearQuestions: () => void;
  onLoadPreset: (presetIndex: number) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
}

const CONTEXT_TAGS = [
  'At Work / Code',
  'Morning Routine',
  'Commute',
  'Conversation',
  'Reading',
  'Shower Thought',
  'Late Night',
  'Observation',
];

export const QuestionCapture: React.FC<QuestionCaptureProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onClearQuestions,
  onLoadPreset,
  onSynthesize,
  isSynthesizing,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedContext, setSelectedContext] = useState('At Work / Code');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('all');

  const recognitionRef = useRef<any>(null);

  // Automatically determine default time of day based on user local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setSelectedTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setSelectedTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 22) setSelectedTimeOfDay('evening');
    else setSelectedTimeOfDay('night');
  }, []);

  // Web Speech API Voice Dictation setup
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const text = inputText.trim();

    try {
      const analysis = await analyzeQuestion(text, selectedContext, selectedTimeOfDay);

      const newQuestion: UserQuestion = {
        id: 'q_' + Date.now(),
        text,
        timestamp: new Date().toISOString(),
        timeOfDay: selectedTimeOfDay,
        contextTag: selectedContext,
        domain: analysis.domain || 'General Inquiry',
        quickAnswer: analysis.quickAnswer || 'Analyzing this core concept...',
        keyConcepts: analysis.keyConcepts || [],
        prerequisiteLevel: analysis.prerequisiteLevel || 'Foundational',
        curiositySpark: analysis.curiositySpark || 'An inquiry that connects to broader principles.',
      };

      onAddQuestion(newQuestion);
      setInputText('');
    } catch (error) {
      console.error('Error logging question:', error);
      // Fallback question addition if server error
      const fallbackQuestion: UserQuestion = {
        id: 'q_' + Date.now(),
        text,
        timestamp: new Date().toISOString(),
        timeOfDay: selectedTimeOfDay,
        contextTag: selectedContext,
        domain: 'Curiosity & Inquiry',
        quickAnswer: 'This question touches on fundamental principles and system relationships.',
        keyConcepts: ['Causal Logic', 'System Dynamics', 'Core Mechanism'],
        prerequisiteLevel: 'Foundational',
        curiositySpark: 'Every question builds the foundation of your personal knowledge tree.',
      };
      onAddQuestion(fallbackQuestion);
      setInputText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeIcon = (tod: TimeOfDay) => {
    switch (tod) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'afternoon':
        return <Coffee className="w-3.5 h-3.5 text-orange-500" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-rose-500" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // Unique domains for filtering
  const allDomains = Array.from(new Set(questions.map((q) => q.domain)));

  const filteredQuestions = questions.filter((q) => {
    const matchesDomain = selectedDomainFilter === 'all' || q.domain === selectedDomainFilter;
    const matchesQuery =
      filterQuery.trim() === '' ||
      q.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
      q.quickAnswer.toLowerCase().includes(filterQuery.toLowerCase()) ||
      q.keyConcepts.some((c) => c.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesDomain && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Question Capture Hero Panel */}
      <section className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="max-w-2xl mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Log your day's questions as they happen
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Encountered a curiosity while coding, commuting, reading, or drinking coffee? Type or
            speak it below. MindThread instantly breaks down the concept and weaves it into your
            curriculum.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Input Area */}
          <div className="relative rounded-xl border border-stone-300 focus-within:border-stone-800 focus-within:ring-2 focus-within:ring-stone-900/5 transition-all bg-white shadow-xs">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Why does coffee sometimes make you more tired, or how does encryption negotiate keys in public?"
              rows={3}
              className="w-full resize-none p-3.5 sm:p-4 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-4 border-t border-stone-100 bg-stone-50/50 rounded-b-xl">
              {/* Context Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1 scrollbar-none">
                <span className="text-stone-400 text-[11px] font-medium mr-1">Context:</span>
                <select
                  value={selectedContext}
                  onChange={(e) => setSelectedContext(e.target.value)}
                  className="bg-white border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-700 focus:outline-hidden focus:border-stone-500 cursor-pointer"
                >
                  {CONTEXT_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTimeOfDay}
                  onChange={(e) => setSelectedTimeOfDay(e.target.value as TimeOfDay)}
                  className="bg-white border border-stone-200 rounded-md px-2 py-1 text-xs text-stone-700 focus:outline-hidden focus:border-stone-500 cursor-pointer"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Late Night</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? 'Stop listening' : 'Dictate question with voice'}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSubmitting}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    !inputText.trim() || isSubmitting
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95 shadow-xs'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deconstructing...</span>
                    </>
                  ) : (
                    <>
                      <span>Log Question</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets & Samples */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-stone-500">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-400">Sample Days:</span>
              <button
                type="button"
                onClick={() => onLoadPreset(0)}
                className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
              >
                Polymath's Thursday (5 questions)
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(1)}
                className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
              >
                Science & Mind (3 questions)
              </button>
            </div>

            {questions.length > 0 && (
              <button
                type="button"
                onClick={onClearQuestions}
                className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear all questions
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Synthesis Callout Banner when questions exist */}
      {questions.length >= 2 && (
        <section className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Synthesis Engine Ready</span>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white">
              {questions.length} questions collected across {allDomains.length} disciplines
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Gemini will uncover the invisible threads connecting your inquiries and generate a
              sequenced, bite-sized curriculum tailored specifically to what piqued your curiosity
              today.
            </p>
          </div>

          <button
            onClick={onSynthesize}
            disabled={isSynthesizing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>Designing Curriculum...</span>
              </>
            ) : (
              <>
                <span>Synthesize Learning Path</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </section>
      )}

      {/* Questions Stream Header & Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 tracking-tight">
              Today's Curiosity Stream
            </h3>
            <p className="text-xs text-stone-500">
              {questions.length} inquiries logged · Chronological stream
            </p>
          </div>

          {questions.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions or concepts..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 w-44 sm:w-56"
                />
              </div>

              {/* Domain Filter */}
              {allDomains.length > 1 && (
                <select
                  value={selectedDomainFilter}
                  onChange={(e) => setSelectedDomainFilter(e.target.value)}
                  className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Disciplines</option>
                  {allDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {questions.length === 0 ? (
          <div className="border border-dashed border-stone-300 rounded-2xl p-10 text-center bg-stone-50/50">
            <Lightbulb className="w-10 h-10 text-amber-500/70 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-stone-800">No questions logged yet today</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
              Think about something you wondered about during your morning routine or at work, or click
              below to try a pre-loaded sample day!
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onLoadPreset(0)}
                className="px-4 py-2 bg-stone-900 text-stone-100 rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
              >
                Load Sample Day (5 Questions)
              </button>
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-500">
            No questions matched your search criteria.
          </div>
        ) : (
          /* Question Stream Cards */
          <div className="grid gap-3.5">
            {filteredQuestions.map((q, idx) => (
              <article
                key={q.id}
                className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 hover:border-stone-300 transition-all shadow-xs"
              >
                {/* Meta Row: Clean typography, zero-pill discipline */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-stone-700">
                      {getTimeIcon(q.timeOfDay)}
                      <span className="capitalize">{q.timeOfDay}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-600">{q.contextTag}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-800">{q.domain}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-400">{q.prerequisiteLevel}</span>
                  </div>

                  <button
                    onClick={() => onDeleteQuestion(q.id)}
                    title="Remove question"
                    className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Question Title */}
                <h4 className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight leading-snug">
                  "{q.text}"
                </h4>

                {/* Instant Quick Answer */}
                <div className="mt-3 bg-stone-50 border-l-2 border-stone-800 pl-3.5 py-2 pr-3 rounded-r-lg">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Instant Insight
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {q.quickAnswer}
                  </p>
                </div>

                {/* Concepts and Spark */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-stone-600">
                    <span className="text-stone-400 text-[11px]">Core Concepts:</span>
                    {q.keyConcepts.map((concept, cIdx) => (
                      <span key={concept} className="font-medium text-stone-700">
                        {concept}
                        {cIdx < q.keyConcepts.length - 1 && <span className="ml-1 text-stone-300">·</span>}
                      </span>
                    ))}
                  </div>

                  {q.curiositySpark && (
                    <div className="text-[11px] text-amber-700 italic max-w-sm">
                      ✨ {q.curiositySpark}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
