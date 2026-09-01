import React from "react";
import { motion } from "motion/react";
import { Award, Flame, Clock, Target, Star, CheckCircle2, History, Trophy } from "lucide-react";
import { UserProgress, Achievement } from "../types";
import { ACHIEVEMENTS_DATABASE } from "../utils/songsData";

interface DashboardProps {
  progress: UserProgress;
  onResetProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, onResetProgress }) => {
  // Format total practice seconds into readable text
  const formatPracticeTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  // Compute average accuracy from sessions
  const calculateAverageAccuracy = (): number => {
    if (progress.sessions.length === 0) return 0;
    const total = progress.sessions.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(total / progress.sessions.length);
  };

  return (
    <div className="flex flex-col gap-8" id="dashboard-center">
      {/* Overview Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Streak Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-mono text-zinc-400 font-medium">Practice Streak</span>
            <p className="text-3xl font-black text-amber-400 font-mono mt-1.5 flex items-baseline gap-1">
              {progress.streakDays} <span className="text-xs font-bold font-sans text-zinc-400">days</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500/20 animate-bounce" />
          </div>
        </motion.div>

        {/* Practice Time Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-mono text-zinc-400 font-medium">Practice Time</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1.5">
              {formatPracticeTime(progress.practiceTimeSeconds)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Avg Accuracy Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-mono text-zinc-400 font-medium">Avg accuracy</span>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1.5">
              {calculateAverageAccuracy()}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Target className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Points/XP Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden"
        >
          <div>
            <span className="text-xs font-mono text-zinc-400 font-medium">Harmonica Points</span>
            <p className="text-3xl font-black text-purple-400 font-mono mt-1.5 flex items-baseline gap-1">
              {progress.totalPoints} <span className="text-xs font-bold font-sans text-zinc-400">XP</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Star className="w-6 h-6 fill-purple-500/20" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Achievements */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2 mb-6 text-sm font-mono tracking-wider uppercase">
              <Trophy className="w-4 h-4 text-amber-500" />
              Unlocked Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS_DATABASE.map((ach) => {
                const isUnlocked = progress.unlockedAchievements.includes(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border flex gap-3 items-start transition-all relative ${
                      isUnlocked
                        ? "bg-amber-950/15 border-amber-500/40 text-amber-200"
                        : "bg-zinc-850/30 border-zinc-800/80 text-zinc-400 opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked ? "bg-amber-500/15 border-amber-500 text-amber-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>

                    <div>
                      <p className={`text-xs font-bold leading-tight ${isUnlocked ? "text-zinc-100" : "text-zinc-400"}`}>
                        {ach.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        {ach.description}
                      </p>
                      {isUnlocked && (
                        <span className="absolute top-2 right-2 text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Recent Practice Sessions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-zinc-100 flex items-center gap-2 mb-4 text-sm font-mono tracking-wider uppercase">
                <History className="w-4 h-4 text-amber-500" />
                Practice History
              </h3>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {progress.sessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500 font-medium">
                    No practice sessions logged yet. Pick a song and hit start!
                  </div>
                ) : (
                  progress.sessions.slice().reverse().map((session, idx) => (
                    <div
                      key={`session-${idx}`}
                      className="bg-zinc-850/40 border border-zinc-800/60 rounded-xl p-3 flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-200">{session.songTitle}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">
                          {session.date} • {formatPracticeTime(session.durationSeconds)} practice
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold font-mono">
                          {session.accuracy}% Match
                        </span>
                        <p className="text-[10px] text-purple-400 font-mono font-semibold mt-1">
                          +{session.pointsEarned} XP
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 border-t border-zinc-800/80 pt-4 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-mono">Offline cache persistent</span>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to reset all progress data? This is irreversible.")) {
                    onResetProgress();
                  }
                }}
                className="text-[10px] hover:text-red-400 text-zinc-500 font-mono underline cursor-pointer"
                id="reset-progress-btn"
              >
                Reset Progress Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
