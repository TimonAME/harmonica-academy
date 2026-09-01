import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Music,
  GraduationCap,
  Trophy,
  Award,
  Sparkles,
  Wifi,
  CloudLightning,
  Flame,
  Volume2,
  Info,
  Check,
  Keyboard
} from "lucide-react";
import { Song, UserProgress, Achievement } from "./types";
import { SONGS_DATABASE, ACHIEVEMENTS_DATABASE } from "./utils/songsData";
import { HarmonicaVisualizer } from "./components/HarmonicaVisualizer";
import { PitchDetector } from "./components/PitchDetector";
import { TabScroller, TabScrollerRef } from "./components/TabScroller";
import { LessonCenter } from "./components/LessonCenter";
import { Dashboard } from "./components/Dashboard";
import { VirtualHarmonica } from "./components/VirtualHarmonica";
import { playChimeSuccess } from "./utils/audioSynth";
import { PitchDetectionSession } from "./utils/pitchDetector";
import { frequencyToNote, findHoleForNote } from "./utils/harmonicaNotes";

const LOCAL_STORAGE_KEY = "harmonica_academy_progress";

const INITIAL_PROGRESS: UserProgress = {
  practiceTimeSeconds: 0,
  streakDays: 1,
  lastPracticeDate: null,
  completedLessons: [],
  masteredSongs: [],
  sessions: [],
  unlockedAchievements: [],
  totalPoints: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"songs" | "sandbox" | "virtual" | "lessons" | "dashboard">("songs");
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS_DATABASE[0]);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024 || window.innerHeight < 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Audio & Pitch Link States
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [activeSecondHole, setActiveSecondHole] = useState<number | null>(null);
  const [activeIsDraw, setActiveIsDraw] = useState<boolean | null>(null);
  const [detectedHole, setDetectedHole] = useState<number | null>(null);
  const [detectedIsDraw, setDetectedIsDraw] = useState<boolean | null>(null);
  const [detectedOffset, setDetectedOffset] = useState<number>(0);

  // Lifted Mic and Pitch Detection Session Engine
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveFreq, setLiveFreq] = useState<number>(-1);
  const [liveNote, setLiveNote] = useState<string | null>(null);

  const sessionRef = useRef<PitchDetectionSession | null>(null);
  const songKeyRef = useRef<string>(selectedSong.key);
  const activeHoleRef = useRef<number | null>(null);
  const activeIsDrawRef = useRef<boolean | null>(null);

  useEffect(() => {
    songKeyRef.current = selectedSong.key;
  }, [selectedSong.key]);

  useEffect(() => {
    activeHoleRef.current = activeHole;
    activeIsDrawRef.current = activeIsDraw;
  }, [activeHole, activeIsDraw]);

  const startMic = async (): Promise<boolean> => {
    setMicError(null);
    const session = new PitchDetectionSession((freq) => {
      if (freq > 0) {
        setLiveFreq(Math.round(freq * 10) / 10);
        const noteMatch = frequencyToNote(freq);
        if (noteMatch) {
          setLiveNote(noteMatch.note);
          setDetectedOffset(noteMatch.cents);

          const holeMatch = findHoleForNote(
            noteMatch.note, 
            songKeyRef.current,
            activeHoleRef.current !== null ? activeHoleRef.current : undefined,
            activeIsDrawRef.current !== null ? activeIsDrawRef.current : undefined
          );
          if (holeMatch) {
            setDetectedHole(holeMatch.hole);
            setDetectedIsDraw(holeMatch.isDraw);
          } else {
            setDetectedHole(null);
            setDetectedIsDraw(null);
          }
        }
      } else {
        setLiveFreq(-1);
        setLiveNote(null);
        setDetectedHole(null);
        setDetectedIsDraw(null);
        setDetectedOffset(0);
      }
    });

    const success = await session.start();
    if (success) {
      sessionRef.current = session;
      setIsMicActive(true);
      return true;
    } else {
      setMicError("Could not access microphone. Please check permissions.");
      setIsMicActive(false);
      return false;
    }
  };

  const stopMic = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    setIsMicActive(false);
    setLiveFreq(-1);
    setLiveNote(null);
    setDetectedHole(null);
    setDetectedIsDraw(null);
    setDetectedOffset(0);
  };

  const toggleMic = async () => {
    if (isMicActive) {
      stopMic();
    } else {
      await startMic();
    }
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
    };
  }, []);

  // Lifted Playback/Practice States for Mic Follow Mode
  const [playMode, setPlayMode] = useState<"autoplay" | "practice">("autoplay");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeCountdown, setActiveCountdown] = useState<number | null>(null);
  const [isSuccessSoundMuted, setIsSuccessSoundMuted] = useState<boolean>(false);
  const tabScrollerRef = useRef<TabScrollerRef | null>(null);

  // User Progression
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [achievementAlert, setAchievementAlert] = useState<Achievement | null>(null);

  // Load progress from localStorage on start
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Clean up or validate streak days
        validateAndSetProgress(parsed);
      } else {
        // First timer
        setProgress(INITIAL_PROGRESS);
      }
    } catch (e) {
      console.error("Failed to load local progress:", e);
    }
  }, []);

  // Save progress changes helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
    } catch (e) {
      console.error("Failed to cache progress offline:", e);
    }
  };

  // Manage streak calculation on login/launch
  const validateAndSetProgress = (data: UserProgress) => {
    if (!data.lastPracticeDate) {
      setProgress(data);
      return;
    }

    const lastDate = new Date(data.lastPracticeDate);
    const today = new Date();
    
    // Clear hours to compare dates only
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let updatedStreak = data.streakDays;
    if (diffDays > 1) {
      // Streak broken
      updatedStreak = 1;
    }

    saveProgress({
      ...data,
      streakDays: updatedStreak,
    });
  };

  // Trigger achievement evaluations
  const checkForAchievements = (updatedProgress: UserProgress) => {
    const newlyUnlocked: string[] = [];
    
    for (const achievement of ACHIEVEMENTS_DATABASE) {
      if (updatedProgress.unlockedAchievements.includes(achievement.id)) continue;

      let meetsRequirement = false;

      switch (achievement.requirementType) {
        case "points":
          meetsRequirement = updatedProgress.totalPoints >= achievement.requirementValue;
          break;
        case "streak":
          meetsRequirement = updatedProgress.streakDays >= achievement.requirementValue;
          break;
        case "lessons":
          meetsRequirement = updatedProgress.completedLessons.length >= achievement.requirementValue;
          break;
        case "songs":
          meetsRequirement = updatedProgress.masteredSongs.length >= achievement.requirementValue;
          break;
        case "accuracy":
          const bestAccuracy = updatedProgress.sessions.reduce(
            (max, s) => (s.accuracy > max ? s.accuracy : max),
            0
          );
          meetsRequirement = bestAccuracy >= achievement.requirementValue;
          break;
      }

      if (meetsRequirement) {
        newlyUnlocked.push(achievement.id);
        // Alert user
        triggerAchievementBanner(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      return {
        ...updatedProgress,
        unlockedAchievements: [...updatedProgress.unlockedAchievements, ...newlyUnlocked],
      };
    }
    return updatedProgress;
  };

  const triggerAchievementBanner = (achievement: Achievement) => {
    setAchievementAlert(achievement);
    playChimeSuccess();
    setTimeout(() => {
      setAchievementAlert(null);
    }, 5000);
  };

  // Handle successful completion of a song practice session
  const handleSessionComplete = (accuracy: number, durationSeconds: number) => {
    const todayStr = new Date().toLocaleDateString();
    
    // Calculate points awarded
    // Base 50 points for completing, plus up to 50 points proportional to accuracy
    const accuracyPoints = Math.round(accuracy * 0.5);
    const earnedPoints = 50 + accuracyPoints;

    const newSession = {
      date: todayStr,
      songId: selectedSong.id,
      songTitle: selectedSong.title,
      durationSeconds: durationSeconds || 30, // fallback
      accuracy,
      pointsEarned: earnedPoints,
    };

    // Evaluate streak
    let updatedStreak = progress.streakDays;
    const lastDateStr = progress.lastPracticeDate;
    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const today = new Date();
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Streak continues!
        updatedStreak += 1;
      }
    }

    // Is song mastered? (Accuracy >= 80%)
    const mastered = [...progress.masteredSongs];
    if (accuracy >= 80 && !mastered.includes(selectedSong.id)) {
      mastered.push(selectedSong.id);
    }

    let updatedProgress: UserProgress = {
      ...progress,
      practiceTimeSeconds: progress.practiceTimeSeconds + (durationSeconds || 30),
      streakDays: updatedStreak,
      lastPracticeDate: new Date().toISOString(),
      sessions: [...progress.sessions, newSession],
      masteredSongs: mastered,
      totalPoints: progress.totalPoints + earnedPoints,
    };

    // Check awards
    updatedProgress = checkForAchievements(updatedProgress);
    saveProgress(updatedProgress);
  };

  // Handle step lesson checkmarks
  const handleLessonComplete = (lessonId: string) => {
    if (progress.completedLessons.includes(lessonId)) return;

    let updatedProgress: UserProgress = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      totalPoints: progress.totalPoints + 100, // 100 XP for lessons!
    };

    updatedProgress = checkForAchievements(updatedProgress);
    saveProgress(updatedProgress);
    playChimeSuccess();
  };

  // Reset progress data
  const handleResetProgress = () => {
    saveProgress(INITIAL_PROGRESS);
  };

  // Active song loader
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setActiveTab("sandbox");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans">
      
      {/* Top Header & Navigation */}
      <header className="hidden md:flex border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-40 px-4 py-2.5 md:px-6 md:py-4 flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
            <Music className="w-5 h-5 md:w-6 md:h-6 text-zinc-950" />
          </div>
          <div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-zinc-100 leading-none">
              Harmonica<span className="text-amber-500">Academy</span>
            </span>
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-mono tracking-wider leading-none mt-0.5">Diatonic Masterclass</p>
          </div>
        </div>

        {/* Global Nav Tabs - HIDDEN ON MOBILE, FLEX ON DESKTOP */}
        <nav className="hidden md:flex items-center bg-zinc-800 p-1 rounded-full gap-1">
          <button
            onClick={() => setActiveTab("songs")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "songs"
                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            id="nav-songs"
          >
            <Compass className="w-3.5 h-3.5" />
            Songs & Riffs
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "sandbox"
                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            id="nav-sandbox"
          >
            <Music className="w-3.5 h-3.5" />
            Sandbox Play
          </button>

          <button
            onClick={() => setActiveTab("virtual")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "virtual"
                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            id="nav-virtual"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Playable Harp
          </button>

          <button
            onClick={() => setActiveTab("lessons")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "lessons"
                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            id="nav-lessons"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Lessons
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "dashboard"
                ? "bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            id="nav-dashboard"
          >
            <Trophy className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </nav>

        {/* Status indicator: Offline Ready */}
        <div className="flex items-center gap-1.5 md:gap-2 text-xs bg-zinc-900 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-zinc-800 text-zinc-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold text-[10px] md:text-xs">
            <span className="hidden sm:inline">Offline Ready</span>
            <span className="sm:hidden">Ready</span>
          </span>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 pb-24 md:p-8 md:pb-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SONGS DIRECTORY */}
          {activeTab === "songs" && (
            <motion.div
              key="songs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-black text-zinc-100">Practice Songbook</h2>
                <p className="text-xs text-zinc-400 mt-1">Select a classic folk tune or real blues riffs in varying keys to load the tabs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SONGS_DATABASE.map((song) => {
                  const isMastered = progress.masteredSongs.includes(song.id);
                  const isCurrentlySelected = selectedSong.id === song.id;

                  return (
                    <motion.div
                      whileHover={{ y: -4 }}
                      key={song.id}
                      className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col justify-between h-56 shadow-lg transition-all ${
                        isCurrentlySelected
                          ? "border-amber-500 shadow-amber-500/10 bg-amber-500/5"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded font-bold ${
                            song.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400" :
                            song.difficulty === "medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          }`}>
                            {song.difficulty}
                          </span>
                          <span className="text-xs bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-lg font-mono font-bold text-zinc-300">
                            Key of {song.key}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-zinc-100">{song.title}</h3>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {song.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4 border-t border-zinc-800 pt-3">
                        <div className="flex items-center gap-2">
                          {isMastered && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold font-mono">
                              <Check className="w-3 h-3" /> Mastered
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleSelectSong(song)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          Practice Tabs
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE SANDBOX PLAYGROUND */}
          {activeTab === "sandbox" && (
            <motion.div
              key="sandbox-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Sandbox Area: Scrollable tabs & visualizer plate */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* 1. Scrolling Tabs Sheet */}
                <TabScroller
                  ref={tabScrollerRef}
                  song={selectedSong}
                  detectedHole={detectedHole}
                  detectedIsDraw={detectedIsDraw}
                  onSessionComplete={handleSessionComplete}
                  onActiveNoteChange={(hole, isDraw, secondHole) => {
                    setActiveHole(hole);
                    setActiveIsDraw(isDraw);
                    setActiveSecondHole(secondHole || null);
                  }}
                  playMode={playMode}
                  onPlaybackStateChange={(playing, countdown) => {
                    setIsPlaying(playing);
                    setActiveCountdown(countdown);
                  }}
                  isSuccessSoundMuted={isSuccessSoundMuted}
                  isCompact={isCompact}
                />

                {/* 2. Visual Harmonica Plate */}
                <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl ${isCompact ? "p-3" : "p-6"}`}>
                  <h3 className="font-bold text-zinc-200 text-sm font-mono uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                    Visual Harp Guide
                  </h3>
                  <HarmonicaVisualizer
                    harmonicaKey={selectedSong.key}
                    activeHole={activeHole}
                    activeSecondHole={activeSecondHole}
                    activeIsDraw={activeIsDraw}
                    detectedHole={detectedHole}
                    detectedIsDraw={detectedIsDraw}
                    detectedPitchOffset={detectedOffset}
                    isCompact={isCompact}
                  />
                </div>
              </div>

              {/* Right Sidebar Area: Pitch detector & quick guides */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <PitchDetector
                  harmonicaKey={selectedSong.key}
                  isMicActive={isMicActive}
                  toggleMic={toggleMic}
                  micError={micError}
                  liveFreq={liveFreq}
                  liveNote={liveNote}
                  centsOffset={detectedOffset}
                  detectedHole={detectedHole !== null ? { hole: detectedHole, isDraw: detectedIsDraw || false, isBend: false } : null}
                  playMode={playMode}
                  onPlayModeChange={setPlayMode}
                  isPlaying={isPlaying}
                  activeCountdown={activeCountdown}
                  onStartPractice={async () => {
                    let micOk = isMicActive;
                    if (!isMicActive) {
                      micOk = await startMic();
                    }
                    if (micOk && tabScrollerRef.current) {
                      tabScrollerRef.current.startPlayback();
                    }
                  }}
                  onStopPractice={() => {
                    if (tabScrollerRef.current) {
                      tabScrollerRef.current.pausePlayback();
                    }
                  }}
                  targetHole={activeHole}
                  targetSecondHole={activeSecondHole}
                  targetIsDraw={activeIsDraw}
                  isSuccessSoundMuted={isSuccessSoundMuted}
                  onToggleSuccessSoundMute={() => setIsSuccessSoundMuted((prev) => !prev)}
                  isCompact={isCompact}
                />

                {/* Beginner Tips Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col">
                  <h4 className="font-bold text-zinc-200 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-500" />
                    Acoustic Practice Tips
                  </h4>
                  <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                    <li>• Keep your harmonica parallel to the floor; do not tilt your neck.</li>
                    <li>• Draw/Inhale notes are written with a minus sign (e.g. <strong>-4</strong> means inhale hole 4).</li>
                    <li>• Blow/Exhale notes are positive (e.g. <strong>4</strong> means exhale hole 4).</li>
                    <li>• Breathe deep from your lower abdomen (diaphragm) to secure clean, whistle-free tones.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: STEP-BY-STEP LESSONS */}
          {activeTab === "lessons" && (
            <motion.div
              key="lessons-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="mb-2">
                <h2 className="text-2xl font-black text-zinc-100">Harmonica Sandbox Academy</h2>
                <p className="text-xs text-zinc-400 mt-1">Follow simple, visual training sessions with immediate mic checks to verify your mechanical shape.</p>
              </div>

              <LessonCenter
                detectedHole={detectedHole}
                detectedIsDraw={detectedIsDraw}
                onLessonCompleted={handleLessonComplete}
                completedLessons={progress.completedLessons}
              />
            </motion.div>
          )}

          {/* TAB 4: PROGRESS TRACKING DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard progress={progress} onResetProgress={handleResetProgress} />
            </motion.div>
          )}

          {/* TAB 5: VIRTUAL HARMONICA SYNTH */}
          {activeTab === "virtual" && (
            <motion.div
              key="virtual-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <VirtualHarmonica />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER METRICS */}
      <footer className="border-t border-zinc-850 bg-zinc-950 py-6 text-center text-xs font-mono text-zinc-500">
        <p>© 2026 Harmonica Academy • Pure Client-Side Local Persistence Engine</p>
      </footer>

      {/* REAL-TIME ACHIEVEMENT POPUP GAUGE */}
      <AnimatePresence>
        {achievementAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-900 border-2 border-amber-500 text-zinc-100 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Badge Unlocked!
              </span>
              <h4 className="text-sm font-bold text-zinc-100">{achievementAlert.title}</h4>
              <p className="text-xs text-zinc-400 leading-normal mt-0.5">
                {achievementAlert.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar - only visible on mobile, fixed at the bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 border-t border-zinc-800 shadow-[0_-4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md px-2 py-1.5 flex items-center justify-around pb-safe">
        <button
          onClick={() => setActiveTab("songs")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "songs" ? "text-amber-500 font-bold" : "text-zinc-400 hover:text-zinc-300"
          }`}
          id="mobile-nav-songs"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-tight">Songbook</span>
        </button>

        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "sandbox" ? "text-amber-500 font-bold" : "text-zinc-400 hover:text-zinc-300"
          }`}
          id="mobile-nav-sandbox"
        >
          <Music className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-tight">Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab("virtual")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "virtual" ? "text-amber-500 font-bold" : "text-zinc-400 hover:text-zinc-300"
          }`}
          id="mobile-nav-virtual"
        >
          <Keyboard className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-tight">Harp</span>
        </button>

        <button
          onClick={() => setActiveTab("lessons")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "lessons" ? "text-amber-500 font-bold" : "text-zinc-400 hover:text-zinc-300"
          }`}
          id="mobile-nav-lessons"
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-tight">Lessons</span>
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "dashboard" ? "text-amber-500 font-bold" : "text-zinc-400 hover:text-zinc-300"
          }`}
          id="mobile-nav-dashboard"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-tight">Progress</span>
        </button>
      </nav>

    </div>
  );
}
