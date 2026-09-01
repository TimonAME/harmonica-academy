import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  AlignLeft, 
  LayoutGrid, 
  Timer,
  Mic,
  Clock,
  Music,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Song, TabNote } from "../types";
import { findFrequencyForTab } from "../utils/harmonicaNotes";
import { playHarmonicaTone, playChimeSuccess, playMetronomeTick } from "../utils/audioSynth";

export interface TabScrollerRef {
  startPlayback: () => void;
  pausePlayback: () => void;
  stopPlayback: () => void;
}

interface TabScrollerProps {
  song: Song;
  detectedHole: number | null;
  detectedIsDraw: boolean | null;
  onSessionComplete: (accuracy: number, durationSeconds: number) => void;
  onActiveNoteChange: (hole: number | null, isDraw: boolean | null, secondHole?: number | null) => void;
  
  // Lifted props
  playMode: "autoplay" | "practice";
  onPlaybackStateChange?: (isPlaying: boolean, activeCountdown: number | null) => void;
  isSuccessSoundMuted?: boolean;
  isCompact?: boolean;
}

export const TabScroller = forwardRef<TabScrollerRef, TabScrollerProps>(({
  song,
  detectedHole,
  detectedIsDraw,
  onSessionComplete,
  onActiveNoteChange,
  playMode,
  onPlaybackStateChange,
  isSuccessSoundMuted = false,
  isCompact = false,
}, ref) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentNoteIndex, _setCurrentNoteIndex] = useState<number>(-1);
  const currentNoteIndexRef = useRef<number>(-1);
  const setCurrentNoteIndex = (val: number | ((prev: number) => number)) => {
    _setCurrentNoteIndex((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      currentNoteIndexRef.current = next;
      return next;
    });
  };
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x to 1.5x
  const [successNotes, setSuccessNotes] = useState<Record<number, boolean>>({}); // Map index -> success
  const [practiceTime, setPracticeTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"ribbon" | "sheet">("ribbon");
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [showLyrics, setShowLyrics] = useState<boolean>(true);

  // Physical Release / Short Break detection for Practice (Mic Follow) Mode
  const lastMatchTimeRef = useRef<number>(0);
  const hasReleasedRef = useRef<boolean>(true);

  // Metronome (Tempo Clock) states
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false);
  const [metronomeBeat, setMetronomeBeat] = useState<number>(1);

  // Optional and customizable countdown
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(true);
  const [countdownDuration, setCountdownDuration] = useState<number>(3); // 3 seconds default
  const [activeCountdown, setActiveCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeSynthRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hitCountRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // High-precision playback tracking refs
  const playbackPositionMsRef = useRef<number>(0);
  const lastTriggeredNoteIndexRef = useRef<number>(-2);
  const lastTriggeredBeatRef = useRef<number>(-1);

  // Reconstruct words chronologically from the song tabs
  const lyricWords = React.useMemo(() => {
    interface LyricWord {
      text: string;
      tabIndices: number[];
    }

    const words: LyricWord[] = [];
    let currentWord: LyricWord | null = null;

    song.tabs.forEach((tab, index) => {
      const lyric = tab.lyrics || "";
      const isContinuation = lyric.startsWith("-") || (index > 0 && song.tabs[index - 1].lyrics?.endsWith("-"));
      const cleanLyric = lyric.replace(/^-/, "").replace(/-$/, "");

      if (isContinuation && currentWord) {
        currentWord.text += cleanLyric;
        currentWord.tabIndices.push(index);
      } else {
        if (currentWord) {
          words.push(currentWord);
        }
        currentWord = {
          text: cleanLyric,
          tabIndices: [index]
        };
      }
    });

    if (currentWord) {
      words.push(currentWord);
    }

    return words;
  }, [song]);

  // Pre-calculate cumulative timing of notes in milliseconds (at 1x speed)
  const noteTimings = React.useMemo(() => {
    let elapsedBeats = 0;
    const beatDurationMs = (60 / song.tempo) * 1000;
    
    return song.tabs.map((note) => {
      const startBeat = elapsedBeats;
      const durationBeats = note.duration;
      elapsedBeats += durationBeats;
      return {
        startMs: startBeat * beatDurationMs,
        endMs: elapsedBeats * beatDurationMs,
        durationMs: durationBeats * beatDurationMs,
      };
    });
  }, [song]);

  const totalSongDurationMs = React.useMemo(() => {
    if (noteTimings.length === 0) return 0;
    return noteTimings[noteTimings.length - 1].endMs;
  }, [noteTimings]);

  // Auto scroll lyrics container to center the active word horizontally
  useEffect(() => {
    if (currentNoteIndex === -1 || !lyricsContainerRef.current) return;
    const container = lyricsContainerRef.current;
    const activeWordElement = container.querySelector("[data-active-word='true']") as HTMLElement;
    
    if (activeWordElement) {
      const containerWidth = container.clientWidth;
      const elementLeft = activeWordElement.offsetLeft;
      const elementWidth = activeWordElement.clientWidth;
      
      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: "smooth"
      });
    }
  }, [currentNoteIndex]);

  // Notify parent of playback state changes
  useEffect(() => {
    if (onPlaybackStateChange) {
      onPlaybackStateChange(isPlaying, activeCountdown);
    }
  }, [isPlaying, activeCountdown]);

  // Reset states when the song changes
  useEffect(() => {
    stopPlayback();
    setCurrentNoteIndex(-1);
    setSuccessNotes({});
    hitCountRef.current = 0;
    setIsAdvancing(false);
    lastMatchTimeRef.current = 0;
    hasReleasedRef.current = true;
    playbackPositionMsRef.current = 0;
    lastTriggeredNoteIndexRef.current = -2;
    lastTriggeredBeatRef.current = -1;
    onActiveNoteChange(null, null);
  }, [song]);

  // Reset states when the playMode changes (helps prevent weird carry-overs)
  // Automatically mute website generated sounds in practice mode, unmute in autoplay
  useEffect(() => {
    pausePlayback();
    lastMatchTimeRef.current = 0;
    hasReleasedRef.current = true;
    playbackPositionMsRef.current = 0;
    lastTriggeredNoteIndexRef.current = -2;
    lastTriggeredBeatRef.current = -1;
    if (playMode === "practice") {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, [playMode]);

  // Keep track of practice time
  useEffect(() => {
    let practiceInterval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      practiceInterval = setInterval(() => {
        setPracticeTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (practiceInterval) clearInterval(practiceInterval);
    };
  }, [isPlaying]);

  // Release/Break checker effect (detects when user stops playing the current note or plays a different note)
  useEffect(() => {
    if (detectedHole === null) {
      hasReleasedRef.current = true;
    } else {
      const activeNote = currentNoteIndex !== -1 ? song.tabs[currentNoteIndex] : null;
      if (activeNote && (detectedHole !== activeNote.hole || detectedIsDraw !== activeNote.isDraw)) {
        hasReleasedRef.current = true;
      }
    }
  }, [detectedHole, detectedIsDraw, currentNoteIndex, song]);

  // Check if detected pitch matches active note
  useEffect(() => {
    if (currentNoteIndex === -1 || !isPlaying || isAdvancing) {
      return;
    }

    const activeNote = song.tabs[currentNoteIndex];
    if (!activeNote) return;

    const isTargetNotePlaying = 
      (detectedHole === activeNote.hole && detectedIsDraw === activeNote.isDraw) ||
      (activeNote.secondHole !== undefined && detectedHole === activeNote.secondHole && detectedIsDraw === activeNote.isDraw);

    if (isTargetNotePlaying && !successNotes[currentNoteIndex]) {
      // Is this note the same as the previous note?
      const isIdenticalToPrev = 
        currentNoteIndex > 0 &&
        song.tabs[currentNoteIndex - 1].hole === activeNote.hole &&
        song.tabs[currentNoteIndex - 1].isDraw === activeNote.isDraw &&
        song.tabs[currentNoteIndex - 1].secondHole === activeNote.secondHole;

      const now = Date.now();
      const cooldownPassed = (now - lastMatchTimeRef.current) > 350;

      // Allow match if:
      // - It's a different note from the previous one (can match instantly, supporting smooth sliding/legato)
      // - Or it's identical but the user released (breath lift/silence) since the last match
      // - Or a safety cooldown of 350ms has elapsed
      if (!isIdenticalToPrev || hasReleasedRef.current || cooldownPassed) {
        // It's a match!
        setSuccessNotes((prev) => ({ ...prev, [currentNoteIndex]: true }));
        hitCountRef.current += 1;
        if (!isSuccessSoundMuted) {
          playChimeSuccess();
        }

        // Save last match details
        lastMatchTimeRef.current = now;
        hasReleasedRef.current = false;

        if (playMode === "practice") {
          setIsAdvancing(true);
          if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
          }
          advanceTimeoutRef.current = setTimeout(() => {
            setCurrentNoteIndex((prev) => prev + 1);
            setIsAdvancing(false);
            advanceTimeoutRef.current = null;
          }, 250); // Fast, responsive 250ms transition
        }
      }
    }
  }, [
    detectedHole,
    detectedIsDraw,
    currentNoteIndex,
    isPlaying,
    song,
    successNotes,
    playMode,
    isAdvancing,
    isSuccessSoundMuted
  ]);

  // High-Precision Unified Tempo Clock and Note Scheduler
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const beatDurationMs = (60 / song.tempo) * 1000;

    const tick = () => {
      const now = Date.now();
      const elapsedRealMs = now - startTimeRef.current;
      const currentPlayheadMs = elapsedRealMs * playbackSpeed;

      if (playMode === "autoplay") {
        // 1. Song completion check
        if (currentPlayheadMs >= totalSongDurationMs) {
          setIsPlaying(false);
          setCurrentNoteIndex(-1);
          playbackPositionMsRef.current = 0;
          onActiveNoteChange(null, null, null);
          
          const totalNotes = song.tabs.length;
          if (totalNotes > 0) {
            const accuracy = Math.round((hitCountRef.current / totalNotes) * 100);
            onSessionComplete(accuracy, practiceTime);
          }
          hitCountRef.current = 0;
          setPracticeTime(0);
          return;
        }

        // 2. Find active note based on current playhead position
        const activeNoteIdx = noteTimings.findIndex(
          (t) => currentPlayheadMs >= t.startMs && currentPlayheadMs < t.endMs
        );

        if (activeNoteIdx !== -1) {
          // Update visual active note state
          if (activeNoteIdx !== currentNoteIndexRef.current) {
            setCurrentNoteIndex(activeNoteIdx);
            const activeNote = song.tabs[activeNoteIdx];
            if (activeNote) {
              onActiveNoteChange(activeNote.hole, activeNote.isDraw, activeNote.secondHole);
            }
          }

          // 3. Audio scheduling trigger for active note
          if (activeNoteIdx !== lastTriggeredNoteIndexRef.current) {
            lastTriggeredNoteIndexRef.current = activeNoteIdx;

            // Stop previous synth note
            if (activeSynthRef.current) {
              try {
                activeSynthRef.current.stop();
              } catch (e) {}
              activeSynthRef.current = null;
            }

            const activeNote = song.tabs[activeNoteIdx];
            if (activeNote && !isMuted) {
              const frequency = findFrequencyForTab(
                activeNote.hole,
                activeNote.isDraw,
                activeNote.isBend,
                activeNote.bendLevel || 0,
                song.key
              );
              const actualDurationSeconds = (noteTimings[activeNoteIdx].durationMs / 1000) / playbackSpeed;
              
              // Calculate precise AudioContext-aligned start time
              const targetRealTime = startTimeRef.current + (noteTimings[activeNoteIdx].startMs / playbackSpeed);
              const delaySeconds = (targetRealTime - now) / 1000;
              const playDelay = Math.max(0, delaySeconds);
              
              const activeCtx = (window as any).__harmonica_audio_ctx;
              const startTimeCtx = activeCtx ? activeCtx.currentTime + playDelay : undefined;

              try {
                if (activeNote.secondHole) {
                  const freq1 = frequency;
                  const freq2 = findFrequencyForTab(
                    activeNote.secondHole,
                    activeNote.isDraw,
                    activeNote.isBend,
                    activeNote.bendLevel || 0,
                    song.key
                  );
                  const synth1 = playHarmonicaTone(freq1, actualDurationSeconds, 0.18, startTimeCtx);
                  const synth2 = playHarmonicaTone(freq2, actualDurationSeconds, 0.18, startTimeCtx);
                  activeSynthRef.current = {
                    stop: () => {
                      try { synth1.stop(); } catch (e) {}
                      try { synth2.stop(); } catch (e) {}
                    }
                  };
                } else {
                  activeSynthRef.current = playHarmonicaTone(frequency, actualDurationSeconds, 0.25, startTimeCtx);
                }
              } catch (err) {
                console.error("High-precision tone trigger failed:", err);
              }
            }
          }
        }

        // 4. Metronome scheduling (Autoplay mode)
        if (metronomeEnabled) {
          const beatIdx = Math.floor(currentPlayheadMs / beatDurationMs);
          if (beatIdx !== lastTriggeredBeatRef.current) {
            lastTriggeredBeatRef.current = beatIdx;
            const isDownbeat = (beatIdx % 4 === 0);
            
            const targetBeatRealTime = startTimeRef.current + ((beatIdx * beatDurationMs) / playbackSpeed);
            const delaySeconds = Math.max(0, (targetBeatRealTime - now) / 1000);
            
            const activeCtx = (window as any).__harmonica_audio_ctx;
            const tickTimeCtx = activeCtx ? activeCtx.currentTime + delaySeconds : undefined;
            
            playMetronomeTick(isDownbeat, tickTimeCtx);
            setMetronomeBeat((beatIdx % 4) + 1);
          }
        }
      } else {
        // Practice Mode Metronome (runs independently based on elapsed time)
        if (metronomeEnabled) {
          const beatIdx = Math.floor(currentPlayheadMs / beatDurationMs);
          if (beatIdx !== lastTriggeredBeatRef.current) {
            lastTriggeredBeatRef.current = beatIdx;
            const isDownbeat = (beatIdx % 4 === 0);
            playMetronomeTick(isDownbeat);
            setMetronomeBeat((beatIdx % 4) + 1);
          }
        }
      }
    };

    tick();
    const interval = setInterval(tick, 15);

    return () => {
      clearInterval(interval);
      if (activeSynthRef.current) {
        try {
          activeSynthRef.current.stop();
        } catch (e) {}
        activeSynthRef.current = null;
      }
    };
  }, [
    isPlaying,
    playbackSpeed,
    song,
    isMuted,
    playMode,
    metronomeEnabled,
    noteTimings,
    totalSongDurationMs
  ]);

  // Auto scroll tab container to center the active note
  useEffect(() => {
    if (currentNoteIndex === -1 || !containerRef.current) return;

    const container = containerRef.current;
    const children = container.querySelectorAll("[data-tab-index]");
    const activeElement = children[currentNoteIndex] as HTMLElement;

    if (activeElement) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const elementLeft = activeElement.offsetLeft;
      const elementTop = activeElement.offsetTop;
      const elementWidth = activeElement.clientWidth;
      const elementHeight = activeElement.clientHeight;

      if (viewMode === "ribbon") {
        container.scrollTo({
          left: elementLeft - containerWidth / 2 + elementWidth / 2,
          behavior: "smooth",
        });
      } else {
        container.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentNoteIndex, viewMode]);

  // Cleanup countdown timer, active synths and advance timeout on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  // Expose play/pause controls to parent
  useImperativeHandle(ref, () => ({
    startPlayback,
    pausePlayback,
    stopPlayback,
  }));

  // Global spacebar listener for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const activeEl = document.activeElement;
        if (
          activeEl && 
          (activeEl.tagName === "INPUT" || activeEl.tagName === "SELECT" || activeEl.tagName === "TEXTAREA")
        ) {
          return;
        }
        e.preventDefault();
        if (isPlaying || activeCountdown !== null) {
          pausePlayback();
        } else {
          startPlayback();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, activeCountdown, countdownEnabled, countdownDuration, isMuted, currentNoteIndex]);

  const runStart = () => {
    setIsPlaying(true);
    
    const startIndex = currentNoteIndexRef.current >= song.tabs.length - 1 ? -1 : currentNoteIndexRef.current;
    const nextIndex = startIndex === -1 ? 0 : startIndex;

    if (nextIndex === 0) {
      setSuccessNotes({});
      hitCountRef.current = 0;
      lastMatchTimeRef.current = 0;
      hasReleasedRef.current = true;
      playbackPositionMsRef.current = 0;
      lastTriggeredNoteIndexRef.current = -2;
      lastTriggeredBeatRef.current = -1;
      
      if (containerRef.current) {
        containerRef.current.scrollTo({
          left: 0,
          top: 0,
          behavior: "smooth"
        });
      }
    } else {
      playbackPositionMsRef.current = noteTimings[nextIndex] ? noteTimings[nextIndex].startMs : 0;
      lastTriggeredNoteIndexRef.current = nextIndex - 1;
      const beatDurationMs = (60 / song.tempo) * 1000;
      lastTriggeredBeatRef.current = Math.floor(playbackPositionMsRef.current / beatDurationMs) - 1;
    }

    startTimeRef.current = Date.now() - (playbackPositionMsRef.current / playbackSpeed);
    setCurrentNoteIndex(nextIndex);
  };

  const startPlayback = () => {
    if (isPlaying || activeCountdown !== null) return;

    const startIndex = currentNoteIndexRef.current >= song.tabs.length - 1 ? -1 : currentNoteIndexRef.current;
    if (containerRef.current && (startIndex === -1 || startIndex === 0)) {
      containerRef.current.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
      });
    }

    if (countdownEnabled) {
      setActiveCountdown(countdownDuration);
      
      if (!isMuted || metronomeEnabled) {
        try {
          playMetronomeTick(true); // High pitch tick
        } catch (e) {}
      }

      let currentVal = countdownDuration;
      countdownIntervalRef.current = setInterval(() => {
        currentVal -= 1;
        if (currentVal > 0) {
          setActiveCountdown(currentVal);
          if (!isMuted || metronomeEnabled) {
            try {
              playMetronomeTick(true);
            } catch (e) {}
          }
        } else {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setActiveCountdown(null);
          runStart();
        }
      }, 1000);
    } else {
      runStart();
    }
  };

  const pausePlayback = () => {
    if (isPlaying && startTimeRef.current > 0) {
      const elapsed = (Date.now() - startTimeRef.current) * playbackSpeed;
      playbackPositionMsRef.current = Math.max(0, Math.min(totalSongDurationMs, elapsed));
    }

    setIsPlaying(false);
    setActiveCountdown(null);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setIsAdvancing(false);
    if (activeSynthRef.current) {
      try {
        activeSynthRef.current.stop();
      } catch (e) {}
      activeSynthRef.current = null;
    }
    onActiveNoteChange(null, null);
  };

  const stopPlayback = () => {
    pausePlayback();
    playbackPositionMsRef.current = 0;
    lastTriggeredNoteIndexRef.current = -2;
    lastTriggeredBeatRef.current = -1;
    setCurrentNoteIndex(-1);
    setSuccessNotes({});
    hitCountRef.current = 0;
    setPracticeTime(0);
    lastMatchTimeRef.current = 0;
    hasReleasedRef.current = true;
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col ${isCompact ? "p-3 gap-2" : "p-6 shadow-xl"}`} id="tab-scroller">
      {/* Header Info */}
      {!isCompact ? (
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold ${
              song.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400" :
              song.difficulty === "medium" ? "bg-amber-500/10 text-amber-400" :
              "bg-rose-500/10 text-rose-400"
            }`}>
              {song.difficulty} • Key of {song.key}
            </span>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">{song.title}</h2>
            <p className="text-xs text-zinc-400 max-w-md mt-1">{song.description}</p>
          </div>

          {/* Practice Stats Overlay */}
          <div className="flex gap-4">
            <div className="bg-zinc-850 border border-zinc-800 px-3 py-1.5 rounded-xl text-right">
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Accuracy</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                {song.tabs.length > 0 ? Math.round((hitCountRef.current / song.tabs.length) * 100) : 0}%
              </p>
            </div>
            <div className="bg-zinc-850 border border-zinc-800 px-3 py-1.5 rounded-xl text-right">
              <p className="text-[10px] text-zinc-400 uppercase font-mono">BPM</p>
              <p className="text-lg font-bold text-zinc-200 font-mono">{song.tempo}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-1 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-850">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-zinc-100 leading-none">{song.title}</h2>
            <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold leading-none">Key: {song.key}</span>
          </div>
          <div className="flex gap-2.5 text-[10px] font-mono">
            <span>Match: <strong className="text-emerald-400">{song.tabs.length > 0 ? Math.round((hitCountRef.current / song.tabs.length) * 100) : 0}%</strong></span>
            <span>BPM: <strong className="text-zinc-300">{song.tempo}</strong></span>
          </div>
        </div>
      )}

      {/* Tab Ribbon/Sheet Toolbar Controls */}
      <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${isCompact ? "mb-1.5" : "mb-3"}`}>
        <span className="text-xs font-mono font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
          {viewMode === "ribbon" ? "Scrolling Ribbon View" : "Full Tab Sheet View"}
          <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-normal">
            Note {currentNoteIndex !== -1 ? currentNoteIndex + 1 : 1} of {song.tabs.length}
          </span>
        </span>
        
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Optional & Customizable Countdown Controls */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setCountdownEnabled((prev) => !prev)}
              className={`p-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                countdownEnabled
                  ? "bg-amber-500 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title={countdownEnabled ? "Disable Pre-play Countdown" : "Enable Pre-play Countdown"}
            >
              <Timer className="w-3 h-3" />
              <span className="hidden md:inline text-[10px]">Countdown</span>
            </button>
            {countdownEnabled && (
              <select
                value={countdownDuration}
                onChange={(e) => setCountdownDuration(parseInt(e.target.value))}
                className="bg-zinc-900 text-zinc-200 text-[10px] border border-zinc-800 rounded px-1 py-0.5 outline-none cursor-pointer font-mono"
                title="Countdown duration"
              >
                <option value={2}>2s</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
              </select>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5 flex items-center gap-0.5">
            <button
              onClick={() => setViewMode("ribbon")}
              className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "ribbon"
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Ribbon View (Horizontal Scroll)"
            >
              <AlignLeft className="w-3 h-3" />
              <span className="hidden sm:inline text-[10px]">Ribbon</span>
            </button>
            <button
              onClick={() => setViewMode("sheet")}
              className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "sheet"
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Sheet View (Wrapped Grid)"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline text-[10px]">Sheet</span>
            </button>
          </div>

          {/* Metronome / Tempo Clock */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setMetronomeEnabled((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                metronomeEnabled
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title={metronomeEnabled ? "Disable Tempo Clock" : "Enable Tempo Clock (Metronome)"}
              id="metronome-toggle-btn"
            >
              <Clock className={`w-3 h-3 ${metronomeEnabled && isPlaying ? "animate-pulse text-zinc-950" : ""}`} />
              <span className="text-[10px]">Clock</span>
            </button>
            {metronomeEnabled && (
              <div className="flex gap-0.5 px-1" title={`Beat ${metronomeBeat} of 4`}>
                {[1, 2, 3, 4].map((b) => (
                  <div
                    key={b}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
                      !isPlaying 
                        ? "bg-zinc-800" 
                        : metronomeBeat === b 
                          ? b === 1 
                            ? "bg-emerald-400 scale-125" 
                            : "bg-amber-400 scale-110"
                          : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DUAL-MODE TAB STRIP CONTAINER */}
      <div 
        ref={containerRef}
        className={`relative w-full bg-zinc-950 border border-zinc-800/80 rounded-xl scrollbar-none shadow-inner overflow-hidden transition-all duration-300 ${
          isCompact ? "mb-1.5 p-2" : "mb-6 p-4"
        } ${
          viewMode === "ribbon" 
            ? isCompact ? "h-[84px] flex items-center overflow-x-auto" : "h-32 flex items-center overflow-x-auto" 
            : isCompact ? "min-h-[140px] max-h-[220px] overflow-y-auto" : "min-h-[420px] max-h-[600px] overflow-y-auto"
        }`} 
        id="tabs-strip-container"
      >
        {viewMode === "ribbon" && (
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-500/30 pointer-events-none z-10 flex flex-col justify-between py-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 -ml-[3px] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500 -ml-[3px] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
          </div>
        )}

        <div className={`transition-all duration-300 ${
          viewMode === "ribbon" 
            ? "flex items-center gap-4 pl-8 pr-12 min-w-max h-full" 
            : "flex flex-wrap gap-3 p-2 justify-start"
        }`}>
          {song.tabs.map((tab, idx) => {
            const isActive = idx === currentNoteIndex;
            const isSuccess = successNotes[idx];
            
            return (
              <motion.div
                key={idx}
                data-tab-index={idx}
                onClick={() => {
                  const targetIndex = idx;
                  setCurrentNoteIndex(targetIndex);
                  
                  playbackPositionMsRef.current = noteTimings[targetIndex] ? noteTimings[targetIndex].startMs : 0;
                  lastTriggeredNoteIndexRef.current = targetIndex - 1;
                  const beatDurationMs = (60 / song.tempo) * 1000;
                  lastTriggeredBeatRef.current = Math.floor(playbackPositionMsRef.current / beatDurationMs) - 1;
                  
                  if (isPlaying) {
                    startTimeRef.current = Date.now() - (playbackPositionMsRef.current / playbackSpeed);
                  }
                  
                  if (activeSynthRef.current) {
                    try {
                      activeSynthRef.current.stop();
                    } catch (e) {}
                    activeSynthRef.current = null;
                  }
                  
                  onActiveNoteChange(tab.hole, tab.isDraw, tab.secondHole);
                }}
                className={`relative rounded-xl flex flex-col items-center justify-center select-none transition-all duration-300 cursor-pointer ${
                  isCompact ? "p-1.5 min-w-[55px]" : "p-3 min-w-[70px]"
                } ${
                  isActive 
                    ? "bg-amber-500 text-zinc-950 font-black scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20 border border-amber-400" 
                    : isSuccess 
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                      : "bg-zinc-900 border border-zinc-850 text-zinc-400 hover:border-zinc-700"
                }`}
                whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                layout
              >
                {/* Note Hole and direction symbol */}
                <div className={`${isCompact ? "text-xs" : "text-sm"} font-bold flex items-center gap-0.5`}>
                  <span>
                    {tab.secondHole 
                      ? (tab.isDraw ? `-${tab.hole}, -${tab.secondHole}` : `${tab.hole}, ${tab.secondHole}`)
                      : (tab.isDraw ? `-${tab.hole}` : tab.hole)}
                  </span>
                  {tab.isBend && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      {"'".repeat(tab.bendLevel || 1)}
                    </span>
                  )}
                </div>

                {/* Sub-label showing Blow vs Draw */}
                {!isCompact && (
                  <span className="text-[9px] font-mono uppercase tracking-wider opacity-60 mt-0.5">
                    {tab.isDraw ? "draw" : "blow"}
                  </span>
                )}

                {/* Optional Note Pitch Letter Name (e.g., C4, G4) */}
                <span className="text-[9px] font-semibold mt-0.5 font-mono opacity-85">
                  {tab.noteName}
                </span>

                {/* Syllable Lyric Text overlay */}
                {tab.lyrics && (
                  <span className={`text-[9px] mt-0.5 font-sans font-bold leading-none truncate max-w-[50px] ${
                    isActive ? "text-zinc-950/90" : "text-amber-200/70"
                  }`}>
                    {tab.lyrics}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SYNCHRONIZED LYRICS CONTAINER */}
      {!isCompact && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl mb-6 p-4 shadow-md backdrop-blur-sm animate-fade-in">
          <div 
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowLyrics(!showLyrics)}
          >
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500 animate-pulse" />
              <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-zinc-300">
                Synchronized Lyrics
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500">
                {currentNoteIndex === -1 ? "Ready" : `Syllable ${currentNoteIndex + 1} of ${song.tabs.length}`}
              </span>
              {showLyrics ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </div>

          {showLyrics && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-zinc-900"
            >
              <div 
                ref={lyricsContainerRef}
                className="w-full overflow-x-auto overflow-y-hidden scrollbar-none py-3 scroll-smooth"
                id="lyrics-scroll-viewport"
              >
                <div className="flex flex-row flex-nowrap items-center gap-x-5 px-[45%] py-1">
                  {lyricWords.map((word, wordIdx) => {
                    const isWordActive = word.tabIndices.includes(currentNoteIndex);
                    
                    return (
                      <span
                        key={wordIdx}
                        data-active-word={isWordActive ? "true" : "false"}
                        onClick={() => {
                          // Interactive seeking! Click a word to jump to that index
                          const targetIndex = word.tabIndices[0];
                          setCurrentNoteIndex(targetIndex);
                          
                          playbackPositionMsRef.current = noteTimings[targetIndex] ? noteTimings[targetIndex].startMs : 0;
                          lastTriggeredNoteIndexRef.current = targetIndex - 1;
                          const beatDurationMs = (60 / song.tempo) * 1000;
                          lastTriggeredBeatRef.current = Math.floor(playbackPositionMsRef.current / beatDurationMs) - 1;
                          
                          if (isPlaying) {
                            startTimeRef.current = Date.now() - (playbackPositionMsRef.current / playbackSpeed);
                          }
                          
                          if (activeSynthRef.current) {
                            try {
                              activeSynthRef.current.stop();
                            } catch (e) {}
                            activeSynthRef.current = null;
                          }
                          
                          onActiveNoteChange(
                            song.tabs[targetIndex].hole,
                            song.tabs[targetIndex].isDraw,
                            song.tabs[targetIndex].secondHole
                          );
                        }}
                        className={`cursor-pointer transition-all duration-200 select-none py-1.5 px-3 rounded text-sm md:text-base font-semibold shrink-0 whitespace-nowrap ${
                          isWordActive
                            ? "bg-amber-500 text-zinc-950 font-black scale-105 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                        }`}
                        title="Click word to seek here"
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Match Guidance Box */}
      <AnimatePresence>
        {isPlaying && currentNoteIndex !== -1 && song.tabs[currentNoteIndex] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`border rounded-xl flex gap-2 text-xs transition-colors duration-300 ${
              isCompact ? "p-1.5 mb-1.5" : "p-3.5 mb-6"
            } ${
              playMode === "practice"
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-850/50 border-zinc-800 text-zinc-300"
            }`}
          >
            {playMode === "practice" ? (
              <Mic className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div>
              <span className="font-semibold block leading-none mb-1">
                {playMode === "practice" ? "Mic Follow Mode" : "Auto Play"}
              </span>
              <span className="opacity-90 leading-normal text-[11px]">
                {!isCompact ? (
                  <>
                    Play Hole{" "}
                    <strong className={playMode === "practice" ? "text-emerald-300 font-bold" : "text-zinc-100 font-bold"}>
                      {song.tabs[currentNoteIndex]?.isDraw ? "Draw (-" : "Blow ("}
                      {song.tabs[currentNoteIndex]?.hole}
                      {song.tabs[currentNoteIndex]?.isBend ? "'".repeat(song.tabs[currentNoteIndex]?.bendLevel || 1) : ""}
                      {")"}
                    </strong>{" "}
                    on your C harmonica. {playMode === "practice" ? "The app is listening and will automatically advance to the next note once a clean pitch match followed by a brief break is registered." : "The app scrolls automatically based on the song tempo."}
                  </>
                ) : (
                  <>
                    Play Hole{" "}
                    <strong className={playMode === "practice" ? "text-emerald-300 font-black text-xs" : "text-zinc-100 font-black text-xs"}>
                      {song.tabs[currentNoteIndex]?.isDraw ? "Draw (-" : "Blow ("}
                      {song.tabs[currentNoteIndex]?.hole}
                      {song.tabs[currentNoteIndex]?.isBend ? "'".repeat(song.tabs[currentNoteIndex]?.bendLevel || 1) : ""}
                      {")"}
                    </strong>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className={`relative overflow-hidden flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-950/40 border border-zinc-850 rounded-xl ${
        isCompact ? "p-2" : "p-4"
      }`}>
        {/* Pre-play Countdown Visual Overlay */}
        <AnimatePresence>
          {activeCountdown !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-xl pointer-events-auto"
            >
              <motion.div
                key={activeCountdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center"
              >
                <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase font-bold animate-pulse flex items-center gap-1.5 leading-none">
                  <Timer className="w-3.5 h-3.5" /> Get Ready
                </span>
                <span className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] leading-none my-1">
                  {activeCountdown}
                </span>
                <button 
                  onClick={pausePlayback}
                  className="text-[10px] text-zinc-400 hover:text-rose-400 underline decoration-dotted underline-offset-2 transition-all font-mono cursor-pointer"
                >
                  Cancel (Spacebar)
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause/Stop Controls */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <button
              onClick={pausePlayback}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-all"
              title="Pause Session"
              id="pause-btn"
            >
              <Pause className="w-5 h-5 fill-zinc-950" />
            </button>
          ) : (
            <button
              onClick={startPlayback}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
              title="Start Practice Session"
              id="play-btn"
            >
              <Play className="w-5 h-5 fill-zinc-950 ml-1" />
            </button>
          )}

          <button
            onClick={stopPlayback}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer transition-all"
            title="Reset Song"
            id="reset-btn"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mute Toggle (moved here to declutter top toolbar) */}
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
              isMuted
                ? "bg-rose-950/20 border-rose-800 text-rose-400 hover:bg-rose-900/20"
                : "bg-zinc-800 border-zinc-750 text-zinc-300 hover:bg-zinc-700"
            }`}
            title={isMuted ? "Unmute Autoplay Accompaniment Sound" : "Mute Autoplay Accompaniment Sound"}
            id="mute-accompaniment-btn"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
          </button>
        </div>

        {/* Speed Adjustment Slider */}
        <div className="w-full md:w-56 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
            <span>Playback Speed</span>
            <span className="text-amber-400 font-bold">{playbackSpeed.toFixed(2)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.25"
              value={playbackSpeed}
              onChange={(e) => {
                const newSpeed = parseFloat(e.target.value);
                if (isPlaying && startTimeRef.current > 0) {
                  const elapsedReal = Date.now() - startTimeRef.current;
                  const playheadMs = elapsedReal * playbackSpeed;
                  startTimeRef.current = Date.now() - (playheadMs / newSpeed);
                }
                setPlaybackSpeed(newSpeed);
              }}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              id="speed-range-slider"
            />
            <FastForward className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Key Info */}
        <div className="text-xs text-zinc-400 font-mono hidden md:block">
          Press spacebar to play/pause
        </div>
      </div>
    </div>
  );
});

TabScroller.displayName = "TabScroller";
