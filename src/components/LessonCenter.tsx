import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, ChevronLeft, ChevronRight, CheckCircle, GraduationCap, ArrowUp, ArrowDown } from "lucide-react";
import { Lesson, LessonStep } from "../types";
import { LESSONS_DATABASE } from "../utils/songsData";

interface LessonCenterProps {
  detectedHole: number | null;
  detectedIsDraw: boolean | null;
  onLessonCompleted: (lessonId: string) => void;
  completedLessons: string[];
}

export const LessonCenter: React.FC<LessonCenterProps> = ({
  detectedHole,
  detectedIsDraw,
  onLessonCompleted,
  completedLessons,
}) => {
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [hasPracticedStep, setHasPracticedStep] = useState<Record<string, boolean>>({});

  const lesson: Lesson = LESSONS_DATABASE[activeLessonIndex];
  const step: LessonStep = lesson.steps[activeStepIndex];

  const handleNextStep = () => {
    if (activeStepIndex < lesson.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      // Completed last step of lesson!
      onLessonCompleted(lesson.id);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const selectLesson = (idx: number) => {
    setActiveLessonIndex(idx);
    setActiveStepIndex(0);
  };

  // Real-time lesson match criteria checking
  React.useEffect(() => {
    if (step.targetHole) {
      if (detectedHole === step.targetHole && detectedIsDraw === step.targetIsDraw) {
        const practiceKey = `${lesson.id}-${activeStepIndex}`;
        if (!hasPracticedStep[practiceKey]) {
          setHasPracticedStep((prev) => ({ ...prev, [practiceKey]: true }));
        }
      }
    }
  }, [detectedHole, detectedIsDraw, step, activeStepIndex, lesson.id]);

  const currentPracticeKey = `${lesson.id}-${activeStepIndex}`;
  const isPracticed = hasPracticedStep[currentPracticeKey] || false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="lesson-center">
      {/* Sidebar: Lesson Directory */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2 mb-4 text-sm font-mono tracking-wider uppercase text-zinc-400">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            Learning Tracks
          </h3>

          <div className="flex flex-col gap-2">
            {LESSONS_DATABASE.map((l, idx) => {
              const isActive = activeLessonIndex === idx;
              const isDone = completedLessons.includes(l.id);

              return (
                <button
                   key={l.id}
                   onClick={() => selectLesson(idx)}
                   className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                     isActive
                       ? "bg-amber-950/20 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)] text-amber-100 font-medium"
                       : "bg-zinc-850/40 border-zinc-800/80 hover:bg-zinc-800 text-zinc-300"
                   }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{l.title}</p>
                    <p className="text-[10px] text-zinc-400 font-normal mt-1 truncate">
                      {l.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] bg-zinc-800 border border-zinc-700/60 text-zinc-400 px-1.5 py-0.5 rounded-md">
                        {l.durationMinutes} mins
                      </span>
                      {isDone && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Training Sandbox */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[450px] justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Decorative Gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

          {/* Lesson Stage Indicators */}
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800/60 pb-4">
            <div>
              <p className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">
                Step {activeStepIndex + 1} of {lesson.steps.length}
              </p>
              <h2 className="text-lg font-bold text-zinc-100">{step.title}</h2>
            </div>
            <div className="flex gap-1">
              {lesson.steps.map((_, sIdx) => (
                <div
                  key={`step-dot-${sIdx}`}
                  className={`w-4 h-1 rounded-full transition-all duration-300 ${
                    sIdx === activeStepIndex
                      ? "bg-amber-500 w-8"
                      : sIdx < activeStepIndex
                      ? "bg-emerald-500"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Tutorial Visualizer Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4 flex-1">
            {/* Left Column: Descriptions */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {step.instruction}
              </p>

              {step.targetHole && (
                <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    step.targetIsDraw
                      ? "bg-zinc-950/20 border-zinc-500 text-zinc-300"
                      : "bg-amber-950/20 border-amber-500 text-amber-400"
                  }`}>
                    <span className="text-[8px] font-mono leading-none">
                      {step.targetIsDraw ? "Draw" : "Blow"}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {step.targetIsDraw ? "-" : ""}
                      {step.targetHole}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium leading-none mb-1">Target Action</p>
                    <p className="text-sm text-zinc-200 font-bold">
                      {step.targetIsDraw ? "Inhale deeply" : "Exhale steadily"} on Hole {step.targetHole}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: High Quality Animated Diagram */}
            <div className="flex items-center justify-center p-6 bg-zinc-950 border border-zinc-850 rounded-2xl h-64 shadow-inner relative">
              {step.diagramType === "single-note" && (
                <div className="flex flex-col items-center text-center">
                  {/* Lip embouchure animated diagram */}
                  <div className="relative w-32 h-32 mb-2 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500/40"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-xs font-mono font-bold text-amber-400">O Shape</span>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">Tight Pucker Profile</span>
                </div>
              )}

              {step.diagramType === "blow-draw" && (
                <div className="flex flex-col items-center text-center">
                  <div className="flex gap-12 justify-center items-center h-32">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="w-14 h-14 bg-amber-950/20 border-2 border-amber-500 rounded-xl flex items-center justify-center mb-1 text-amber-400"
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowUp className="w-8 h-8" />
                      </motion.div>
                      <span className="text-[10px] text-zinc-400 font-mono">Blow (Exhale)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <motion.div
                        className="w-14 h-14 bg-zinc-950/20 border-2 border-zinc-600 rounded-xl flex items-center justify-center mb-1 text-zinc-400"
                        animate={{ y: [4, -4, 4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowDown className="w-8 h-8" />
                      </motion.div>
                      <span className="text-[10px] text-zinc-400 font-mono">Draw (Inhale)</span>
                    </div>
                  </div>
                </div>
              )}

              {step.diagramType === "bending" && (
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-36 h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-hidden flex flex-col justify-center items-center">
                    {/* Airflow bends down */}
                    <svg className="w-24 h-16" viewBox="0 0 100 50">
                      <motion.path
                        d="M 10 10 Q 50 10 90 10"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="4 4"
                        animate={{ d: ["M 10 10 Q 50 10 90 10", "M 10 10 Q 50 45 90 40", "M 10 10 Q 50 10 90 10"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </svg>
                    <span className="text-[10px] text-zinc-300 font-medium">Bending Air Cavity Shape</span>
                    <span className="text-[9px] text-zinc-500 mt-1">舌 (Tongue) pulls back</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sandbox Live Feedback Indicator */}
          {step.targetHole && (
            <div className="mt-4 border-t border-zinc-800/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Sandbox Feedback:</span>
                <AnimatePresence mode="wait">
                  {isPracticed ? (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Checked! Played perfectly
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs bg-zinc-800 border border-zinc-700/60 text-zinc-400 px-2.5 py-1 rounded-lg animate-pulse"
                    >
                      Waiting for you to play standard Hole {step.targetHole}...
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={handlePrevStep}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs text-zinc-300 cursor-pointer border border-zinc-700 transition-all font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={handleNextStep}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  {activeStepIndex === lesson.steps.length - 1 ? "Complete Lesson" : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
