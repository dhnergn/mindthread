import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Check,
  Share2,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import { LearningPath, LearningUnit } from '../types';

interface LearningPathViewProps {
  currentPath: LearningPath | null;
  onSelectUnit: (unit: LearningUnit) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
  questionCount: number;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  currentPath,
  onSelectUnit,
  onSynthesize,
  isSynthesizing,
  questionCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!currentPath) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
          No Learning Path Synthesized Yet
        </h3>
        <p className="text-sm text-stone-500 mt-2 mb-6 leading-relaxed">
          {questionCount > 0
            ? `You have logged ${questionCount} questions today. Click below to weave them into a sequenced, personalized curriculum with interactive lessons, quizzes, and mental models.`
            : 'Start by logging the random questions you encounter throughout the day, or load a sample day to generate your personalized learning journey.'}
        </p>

        <button
          onClick={onSynthesize}
          disabled={isSynthesizing || questionCount === 0}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 ${
            questionCount === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-stone-900 hover:bg-stone-800 text-white'
          }`}
        >
          <Sparkles className={`w-4 h-4 text-amber-400 ${isSynthesizing ? 'animate-spin' : ''}`} />
          <span>{isSynthesizing ? 'Weaving Curriculum...' : 'Synthesize Learning Path'}</span>
        </button>
      </div>
    );
  }

  const masteredUnits = currentPath.units.filter((u) => u.status === 'mastered').length;
  const progressPercent = Math.round((masteredUnits / currentPath.units.length) * 100);

  const handleCopyMarkdown = () => {
    const md = `# ${currentPath.title}
*${currentPath.subtitle}*

## Thematic Synthesis
${currentPath.thematicSynthesis}

**Core Synergy Insight**: ${currentPath.synergyInsight}

## Curriculum Units
${currentPath.units
  .map(
    (u) => `### ${u.order}. ${u.title} (${u.estimatedMinutes} mins)
*Sparked by inquiry: "${u.sourceQuestionText}"*
- **Why this connects:** ${u.connectionReason}
- **Prerequisites:** ${u.prerequisites.join(', ')}
- **Core Takeaways:**
${u.coreTakeaways.map((t) => `  * ${t}`).join('\n')}
`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${currentPath.title}\n\n${currentPath.thematicSynthesis}\n\n` +
      currentPath.units.map(u => `## Unit ${u.order}: ${u.title}\n${u.subtitle}\nOrigin: ${u.sourceQuestionText}\n`).join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPath.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_curriculum.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Path Header / Hero Card */}
      <section className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Disciplines unboxed meta */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-800">Custom Curriculum</span>
              <span aria-hidden="true">·</span>
              <span>{currentPath.dominantDomains.join(' · ')}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-medium text-stone-700">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                ~{currentPath.estimatedMinutes} mins total
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-tight">
              {currentPath.title}
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              {currentPath.subtitle}
            </p>
          </div>

          {/* Progress & Actions */}
          <div className="flex flex-col gap-3 lg:items-end shrink-0">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 min-w-[200px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-700">Mastery Progress</span>
                <span className="font-bold text-stone-900">
                  {masteredUnits}/{currentPath.units.length} Units ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-stone-900 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                title="Copy curriculum as Markdown notes"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy MD'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                title="Download curriculum file"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={onSynthesize}
                disabled={isSynthesizing}
                title="Regenerate curriculum"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                <span>Re-Synthesize</span>
              </button>
            </div>
          </div>
        </div>

        {/* Synergy Insight Callout */}
        {currentPath.synergyInsight && (
          <div className="mt-6 bg-amber-50/80 border border-amber-200/70 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>The Unifying Thread</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
              "{currentPath.synergyInsight}"
            </p>
          </div>
        )}

        {/* Thematic Synthesis Editorial */}
        {currentPath.thematicSynthesis && (
          <div className="mt-6 pt-6 border-t border-stone-100 text-xs sm:text-sm text-stone-600 space-y-3 leading-relaxed">
            <div className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Editorial Rationale: Why These Questions Belong Together
            </div>
            {currentPath.thematicSynthesis.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx}>{paragraph}</p>
            ))}
          </div>
        )}
      </section>

      {/* Sequenced Roadmap Units */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-stone-900">
            Sequenced Roadmap
          </h3>
          <p className="text-xs text-stone-500">
            Ordered from fundamental mechanics to holistic synthesis. Each module contains an interactive lesson, mental model, and micro-quiz.
          </p>
        </div>

        <div className="space-y-4 relative">
          {/* Vertical connecting line indicator */}
          <div className="hidden sm:block absolute left-8 top-10 bottom-10 w-0.5 bg-stone-200 -z-0" />

          {currentPath.units.map((unit, index) => {
            const isMastered = unit.status === 'mastered';
            const isInProgress = unit.status === 'in_progress';

            return (
              <div
                key={unit.id}
                className={`relative bg-white border rounded-2xl p-5 sm:p-6 transition-all shadow-xs ${
                  isMastered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Step Number Circle */}
                  <div className="flex items-center gap-3 sm:block">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        isMastered
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-900 text-stone-100'
                      }`}
                    >
                      {isMastered ? <CheckCircle2 className="w-5 h-5" /> : `0${unit.order}`}
                    </div>
                    <span className="sm:hidden font-semibold text-stone-800 text-sm">
                      Unit 0{unit.order}
                    </span>
                  </div>

                  {/* Unit Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-stone-500">
                        <span>{unit.estimatedMinutes} min deep-dive</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize font-medium text-stone-700">
                          Status: {unit.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900">
                        {unit.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 font-normal">
                        {unit.subtitle}
                      </p>
                    </div>

                    {/* Origin question callout */}
                    <div className="bg-stone-50 border-l-2 border-stone-400 pl-3 py-1.5 text-xs text-stone-700 rounded-r-md">
                      <span className="font-semibold text-stone-500">Sparked by inquiry:</span>{' '}
                      <span className="italic">"{unit.sourceQuestionText}"</span>
                    </div>

                    {/* Connection Reason */}
                    <p className="text-xs text-stone-500 leading-relaxed">
                      <span className="font-medium text-stone-700">Why here: </span>
                      {unit.connectionReason}
                    </p>

                    {/* Core takeaways */}
                    {unit.coreTakeaways && unit.coreTakeaways.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] text-stone-400 font-medium">Core Insights:</span>
                        {unit.coreTakeaways.map((takeaway, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md text-[11px]"
                          >
                            {takeaway}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA Button to enter Studio */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-stone-400">
                        {unit.prerequisites.length > 0 && (
                          <span>Prereqs: {unit.prerequisites.join(' · ')}</span>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectUnit(unit)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95 ${
                          isMastered
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isMastered ? 'Review Lesson' : 'Launch Interactive Lesson'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
