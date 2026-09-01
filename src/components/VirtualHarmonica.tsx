import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Music, 
  Keyboard, 
  Volume2, 
  Wind, 
  Info, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Activity
} from "lucide-react";
import { playHarmonicaTone, PlaybackNode } from "../utils/audioSynth";
import { HARMONICA_KEYS, findFrequencyForTab, NoteDetails, NOTE_FREQUENCIES } from "../utils/harmonicaNotes";

export const VirtualHarmonica: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [volume, setVolume] = useState<number>(0.25);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  
  // States to track visual toggles (mostly for mouse-only users or visual display)
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [isBendMode, setIsBendMode] = useState<boolean>(false);
  
  // Track currently playing synthesizers to enable precise sustain/release
  const activeNodesRef = useRef<Record<string, { node: PlaybackNode; freq: number; note: string; hole: number; isDraw: boolean; isBend: boolean }>>({});
  
  // Force a re-render of currently active visual playing state
  const [playingStates, setPlayingStates] = useState<Array<{ hole: number; isDraw: boolean; isBend: boolean; note: string; freq: number }>>([]);

  // Mouse Drag Play States & Refs
  const isMousePressedRef = useRef<boolean>(false);
  const dragBreathModeRef = useRef<"blow" | "draw">("blow");
  const activeDragHoleRef = useRef<number | null>(null);

  const layout = HARMONICA_KEYS[selectedKey] || HARMONICA_KEYS.C;
  const holes = Array.from({ length: 10 }, (_, i) => i + 1);

  // Map key string to hole index (0-indexed for simplicity or 1-based hole index)
  const keyToHoleMap: Record<string, number> = {
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "0": 10,
    "q": 1, "w": 2, "e": 3, "r": 4, "t": 5, "y": 6, "u": 7, "i": 8, "o": 9, "p": 10,
  };

  // Helper to trigger playing a note
  const startPlayingNote = (hole: number, isDraw: boolean, isBend: boolean, bendLevel: number = 1) => {
    // Generate a unique identifier for this active note combo
    const identifier = `hole-${hole}-${isDraw ? "draw" : "blow"}-${isBend ? `bend-${bendLevel}` : "natural"}`;
    
    // If already playing this combo, ignore to prevent duplicate nodes
    if (activeNodesRef.current[identifier]) return;

    // Determine the exact note string and frequency
    const holeConfig = layout.find((l) => l.hole === hole);
    if (!holeConfig) return;

    let noteName = "";
    if (!isDraw && !isBend) noteName = holeConfig.blowNote;
    else if (isDraw && !isBend) noteName = holeConfig.drawNote;
    else if (isDraw && isBend && holeConfig.drawBends) {
      const bend = holeConfig.drawBends.find((b) => b.level === bendLevel) || holeConfig.drawBends[0];
      noteName = bend?.note || holeConfig.drawNote;
    } else if (!isDraw && isBend && holeConfig.blowBends) {
      const bend = holeConfig.blowBends.find((b) => b.level === bendLevel) || holeConfig.blowBends[0];
      noteName = bend?.note || holeConfig.blowNote;
    } else {
      noteName = isDraw ? holeConfig.drawNote : holeConfig.blowNote;
    }

    const noteDetail = NOTE_FREQUENCIES.find((n) => n.note === noteName);
    const frequency = noteDetail ? noteDetail.freq : 440;

    // Start audio node (set a long duration since we will manually stop it)
    const node = playHarmonicaTone(frequency, 8.0, volume);

    activeNodesRef.current[identifier] = {
      node,
      freq: frequency,
      note: noteName,
      hole,
      isDraw,
      isBend
    };

    updatePlayingStates();
  };

  const stopPlayingNote = (hole: number, isDraw: boolean, isBend: boolean, bendLevel: number = 1) => {
    const identifier = `hole-${hole}-${isDraw ? "draw" : "blow"}-${isBend ? `bend-${bendLevel}` : "natural"}`;
    if (activeNodesRef.current[identifier]) {
      activeNodesRef.current[identifier].node.stop();
      delete activeNodesRef.current[identifier];
    }
    updatePlayingStates();
  };

  const stopAllNotes = () => {
    const activeNodes = Object.values(activeNodesRef.current) as any[];
    activeNodes.forEach((active) => {
      active.node.stop();
    });
    activeNodesRef.current = {};
    updatePlayingStates();
  };

  const updatePlayingStates = () => {
    const activeNodes = Object.values(activeNodesRef.current) as any[];
    const currentPlaying = activeNodes.map((a) => ({
      hole: a.hole,
      isDraw: a.isDraw,
      isBend: a.isBend,
      note: a.note,
      freq: a.freq,
    }));
    setPlayingStates(currentPlaying);
  };

  // Mouse Drag Play Handlers
  const handleHoleMouseDown = (e: React.MouseEvent, h: number) => {
    e.preventDefault();
    
    // 0 = Left click (Draw / Inhale)
    // 2 = Right click (Blow / Exhale)
    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;
    
    if (!isLeftClick && !isRightClick) return;
    
    const mode = isLeftClick ? "draw" : "blow";
    
    isMousePressedRef.current = true;
    dragBreathModeRef.current = mode;
    activeDragHoleRef.current = h;
    
    // Sync HUD status
    setIsDrawMode(mode === "draw");
    
    // Play the note
    startPlayingNote(h, mode === "draw", isBendMode, 1);
  };

  const handleHoleMouseEnter = (h: number) => {
    if (isMousePressedRef.current) {
      const mode = dragBreathModeRef.current;
      if (activeDragHoleRef.current !== h) {
        // Stop previous hole
        if (activeDragHoleRef.current !== null) {
          const prevHole = activeDragHoleRef.current;
          stopPlayingNote(prevHole, mode === "draw", isBendMode, 1);
          stopPlayingNote(prevHole, !(mode === "draw"), isBendMode, 1);
          stopPlayingNote(prevHole, mode === "draw", !isBendMode, 1);
          stopPlayingNote(prevHole, !(mode === "draw"), !isBendMode, 1);
        }
        
        // Start new hole
        activeDragHoleRef.current = h;
        startPlayingNote(h, mode === "draw", isBendMode, 1);
      }
    }
  };

  // Global mouseup listener to release nodes
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMousePressedRef.current) {
        isMousePressedRef.current = false;
        const mode = dragBreathModeRef.current;
        const h = activeDragHoleRef.current;
        if (h !== null) {
          stopPlayingNote(h, mode === "draw", isBendMode, 1);
          stopPlayingNote(h, !(mode === "draw"), isBendMode, 1);
          stopPlayingNote(h, mode === "draw", !isBendMode, 1);
          stopPlayingNote(h, !(mode === "draw"), !isBendMode, 1);
        }
        activeDragHoleRef.current = null;
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isBendMode, selectedKey, volume]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in inputs or textareas
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Check Breathe/Draw modifier (Spacebar)
      if (e.key === " ") {
        e.preventDefault(); // Stop window scroll
        if (!isDrawMode) {
          setIsDrawMode(true);
          // When toggling breath direction, stop currently active notes to prevent lingering mismatched notes
          stopAllNotes();
        }
        return;
      }

      // Check Bend modifier ("b")
      if (key === "b") {
        if (!isBendMode) {
          setIsBendMode(true);
          stopAllNotes();
        }
        return;
      }

      // Check if it's a hole key
      if (keyToHoleMap[key] !== undefined) {
        const hole = keyToHoleMap[key];
        
        // Mark keyboard key as pressed for visual state
        setActiveKeys((prev) => ({ ...prev, [key]: true }));

        // Check if there are bends available for this action
        const config = layout.find((l) => l.hole === hole);
        const hasBend = isDrawMode 
          ? !!(config && config.drawBends && config.drawBends.length > 0)
          : !!(config && config.blowBends && config.blowBends.length > 0);

        const shouldBend = isBendMode && hasBend;

        startPlayingNote(hole, isDrawMode, shouldBend, 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.key === " ") {
        setIsDrawMode(false);
        stopAllNotes();
        return;
      }

      if (key === "b") {
        setIsBendMode(false);
        stopAllNotes();
        return;
      }

      if (keyToHoleMap[key] !== undefined) {
        const hole = keyToHoleMap[key];
        setActiveKeys((prev) => ({ ...prev, [key]: false }));

        // Stop notes associated with this hole (stop both natural and bent/draw variations to be safe)
        stopPlayingNote(hole, true, true, 1);
        stopPlayingNote(hole, true, false, 1);
        stopPlayingNote(hole, false, true, 1);
        stopPlayingNote(hole, false, false, 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopAllNotes();
    };
  }, [isDrawMode, isBendMode, selectedKey, volume]);

  // Handle sudden volume slide change during active notes
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    // Restart active notes with new volume level if needed
    if (Object.keys(activeNodesRef.current).length > 0) {
      const activeNodes = Object.values(activeNodesRef.current) as any[];
      const notesToRestart = activeNodes.map(n => ({
        hole: n.hole,
        isDraw: n.isDraw,
        isBend: n.isBend
      }));
      stopAllNotes();
      notesToRestart.forEach(n => {
        startPlayingNote(n.hole, n.isDraw, n.isBend, 1);
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto" id="virtual-harmonica-tab">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 border border-zinc-800/85 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> New Feature
            </span>
            <span className="text-xs font-mono text-zinc-500">Diatonic Keyboard Synth</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-2">
            <Music className="w-6 h-6 text-amber-500" />
            Virtual Playable Harp
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Experience playing a physical harp digitally! Play note by note using either your computer mouse or your keyboard. Hold spacebar to simulate breath direction.
          </p>
        </div>

        {/* Global Controls Column */}
        <div className="flex flex-wrap items-center gap-4 md:self-center">
          {/* Key Selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-bold">Harp Key</span>
            <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
              {["C", "G", "A"].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    stopAllNotes();
                    setSelectedKey(k);
                  }}
                  className={`px-3 py-1 text-xs font-bold font-mono rounded cursor-pointer transition-all ${
                    selectedKey === k
                      ? "bg-amber-500 text-zinc-950 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-1 w-32">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-mono tracking-wider font-bold">
              <span>Volume</span>
              <span className="flex items-center gap-0.5"><Volume2 className="w-3 h-3" /> {Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-950 rounded-lg h-1.5 border border-zinc-800/80 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Playing Interactive Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Interactive Harmonica Deck */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Action Breath Status HUD */}
          <div className="bg-zinc-950/60 border border-zinc-900/90 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
            {/* Dynamic breath stream background animation */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
              {isDrawMode ? (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-transparent animate-pulse" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-l from-amber-500 to-transparent animate-pulse" />
              )}
            </div>

            <div className="flex items-center gap-3 z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isDrawMode 
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" 
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}>
                <Wind className={`w-5 h-5 ${isDrawMode ? "animate-spin" : "animate-bounce"}`} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Simulation Breath</span>
                <h4 className={`text-base font-black ${isDrawMode ? "text-blue-400" : "text-amber-400"}`}>
                  {isDrawMode ? "DRAW / INHALE" : "BLOW / EXHALE"}
                </h4>
              </div>
            </div>

            {/* Quick Mode Info */}
            <div className="flex items-center gap-2 z-10">
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold uppercase ${
                isBendMode 
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                  : "bg-zinc-800 text-zinc-400"
              }`}>
                {isBendMode ? "Bending Engaged" : "Natural Pitch"}
              </span>

              <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-lg text-[10px] font-mono text-zinc-500">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Space: Hold to Inhale • B: Hold to Bend</span>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard & Mouse Harp Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Drag/Click or use Q-P keys
            </div>
            
            <h3 className="font-extrabold text-zinc-100 text-sm font-mono uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-amber-500" />
              Tactile Playboard
            </h3>

            {/* HIGH-FIDELITY INTERACTIVE HARMONICA FRAME */}
            <div className="flex flex-col gap-6">
              <div 
                className="relative w-full bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-900 rounded-3xl border-4 border-zinc-700 shadow-2xl overflow-hidden flex flex-col justify-between p-3 select-none"
                onContextMenu={(e) => e.preventDefault()}
                id="interactive-virtual-harp"
              >
                {/* Metal Plate Glossy Accent overlay */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent pointer-events-none rounded-b-2xl"></div>

                {/* Top Coverplate Blow Row Notes */}
                <div className="w-full grid grid-cols-10 gap-1 md:gap-1.5 px-1 mb-2 text-[10px] md:text-xs font-mono text-zinc-400 select-none z-10 text-center">
                  {holes.map((h) => {
                    const holeConfig = layout.find((l) => l.hole === h);
                    const note = holeConfig?.blowNote || "";
                    const isBlowPlaying = playingStates.some((s) => s.hole === h && !s.isDraw && !s.isBend);

                    return (
                      <div
                        key={`top-note-${h}`}
                        className={`flex flex-col items-center transition-all duration-200 ${
                          isBlowPlaying ? "text-amber-400 font-extrabold scale-110" : ""
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider opacity-50">Blow</span>
                        <span className="text-xs md:text-sm font-extrabold">{note}</span>
                        <ArrowUp className={`w-3 h-3 mt-0.5 transition-all ${isBlowPlaying ? "text-amber-400 scale-125 animate-bounce" : "text-zinc-600"}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Comb & Holes Block (Interactive dragging section) */}
                <div className="w-full h-20 md:h-24 bg-zinc-950 rounded-2xl grid grid-cols-10 gap-1 md:gap-1.5 p-1.5 md:p-2 relative border border-zinc-850 z-10">
                  {holes.map((h) => {
                    const isHolePlaying = playingStates.some((s) => s.hole === h);
                    const isHoleBlow = playingStates.some((s) => s.hole === h && !s.isDraw);
                    const isHoleDraw = playingStates.some((s) => s.hole === h && s.isDraw);

                    let holeStyle = "bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200";
                    if (isHolePlaying) {
                      if (isHoleBlow) {
                        holeStyle = "bg-amber-950/40 border-amber-500 text-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.5),0_0_15px_rgba(245,158,11,0.2)]";
                      } else {
                        holeStyle = "bg-blue-950/40 border-blue-500 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.5),0_0_15px_rgba(59,130,246,0.2)]";
                      }
                    }

                    return (
                      <div 
                        key={`comb-hole-${h}`} 
                        className="h-full px-0.5 flex relative"
                        onMouseDown={(e) => handleHoleMouseDown(e, h)}
                        onMouseEnter={() => handleHoleMouseEnter(h)}
                      >
                        <div
                          className={`w-full h-full rounded-xl flex flex-col justify-center items-center border transition-all duration-150 cursor-ew-resize select-none relative ${holeStyle}`}
                          title="Left-Click & Drag for Draw (Inhale) | Right-Click & Drag for Blow (Exhale)"
                        >
                          {/* Wooden Divider partition style matching Sandbox play */}
                          {h < 10 && (
                            <div className="absolute right-[-4px] md:right-[-5px] top-[-6px] bottom-[-6px] w-[4px] md:w-[5px] bg-amber-900 border-r border-amber-950 rounded-sm z-20 shadow-md"></div>
                          )}

                          {/* Hole Number */}
                          <span className={`text-sm md:text-lg font-black tracking-tighter ${isHolePlaying ? "scale-110" : ""}`}>
                            {h}
                          </span>
                          
                          {/* Keyboard binding label */}
                          <span className="text-[8px] md:text-[9px] font-mono opacity-50 mt-0.5">
                            {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"][h - 1]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Coverplate Draw Row Notes */}
                <div className="w-full grid grid-cols-10 gap-1 md:gap-1.5 px-1 mt-2 text-[10px] md:text-xs font-mono text-zinc-400 select-none z-10 text-center">
                  {holes.map((h) => {
                    const holeConfig = layout.find((l) => l.hole === h);
                    const note = holeConfig?.drawNote || "";
                    const isDrawPlaying = playingStates.some((s) => s.hole === h && s.isDraw && !s.isBend);

                    return (
                      <div
                        key={`bottom-note-${h}`}
                        className={`flex flex-col-reverse items-center transition-all duration-200 ${
                          isDrawPlaying ? "text-blue-400 font-extrabold scale-110" : ""
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider opacity-50">Draw</span>
                        <span className="text-xs md:text-sm font-extrabold">{note}</span>
                        <ArrowDown className={`w-3 h-3 mb-0.5 transition-all ${isDrawPlaying ? "text-blue-400 scale-125 animate-bounce" : "text-zinc-600"}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pitch Bends Drawer (Separated visually & neatly mapped) */}
              <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-purple-400">
                  Harp Pitch Bends (Semi-tones)
                </span>
                
                <div className="grid grid-cols-10 gap-1.5">
                  {holes.map((h) => {
                    const holeConfig = layout.find((l) => l.hole === h);
                    const drawBend = holeConfig?.drawBends && holeConfig.drawBends[0];
                    const blowBend = holeConfig?.blowBends && holeConfig.blowBends[0];
                    
                    const hasBend = drawBend || blowBend;
                    const isDrawBend = !!drawBend;
                    const bendNote = drawBend ? drawBend.note : (blowBend ? blowBend.note : "");
                    const freq = NOTE_FREQUENCIES.find((n) => n.note === bendNote)?.freq || 0;

                    const isPlaying = playingStates.some((s) => s.hole === h && s.isBend);

                    if (!hasBend) {
                      return (
                        <div
                          key={`bend-empty-${h}`}
                          className="py-2 rounded-lg border border-zinc-800/20 bg-zinc-950/20 text-zinc-700 flex items-center justify-center text-[9px] font-mono"
                        >
                          -
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`btn-bend-${h}`}
                        onMouseDown={() => startPlayingNote(h, isDrawBend, true, 1)}
                        onMouseUp={() => stopPlayingNote(h, isDrawBend, true, 1)}
                        onMouseLeave={() => stopPlayingNote(h, isDrawBend, true, 1)}
                        onTouchStart={() => startPlayingNote(h, isDrawBend, true, 1)}
                        onTouchEnd={() => stopPlayingNote(h, isDrawBend, true, 1)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer select-none active:scale-95 ${
                          isPlaying
                            ? "bg-purple-600 text-zinc-950 border-purple-400 font-bold shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                            : "bg-zinc-950 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700 text-purple-300"
                        }`}
                      >
                        <span className="text-[7px] opacity-60 font-mono">{isDrawBend ? "Dbend" : "Bbend"}</span>
                        <span className="text-xs font-black">{bendNote}</span>
                        <span className="text-[7px] font-mono opacity-40 mt-0.5">{Math.round(freq)} Hz</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Keyboard Layout Map & Status Monitor */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Audio Output Spectrogram Gauge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <h4 className="font-bold text-zinc-200 text-xs font-mono uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Synth Sound Monitor
            </h4>

            <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-850/80 min-h-[120px] flex flex-col justify-center items-center text-center">
              {playingStates.length > 0 ? (
                <div className="flex flex-col items-center w-full">
                  <div className="flex justify-center items-end gap-1.5 h-10 mb-3.5">
                    {playingStates.map((s, idx) => (
                      <motion.div
                        key={`${s.note}-${idx}`}
                        className={`w-1 rounded-full ${s.isDraw ? "bg-blue-400" : s.isBend ? "bg-purple-400" : "bg-amber-400"}`}
                        animate={{ height: [12, 36, 12] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: idx * 0.1,
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-zinc-200 text-lg font-black font-mono tracking-tight flex items-center gap-1">
                    {playingStates.map((s, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-xs ${
                          s.isDraw 
                            ? "bg-blue-500/20 text-blue-300" 
                            : s.isBend 
                            ? "bg-purple-500/20 text-purple-300" 
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        Hole {s.hole} {s.isDraw ? "Draw" : "Blow"}: {s.note} ({Math.round(s.freq)}Hz)
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 flex flex-col items-center">
                  <span className="text-xs text-zinc-500 font-mono">Output Idle</span>
                  <span className="text-[10px] text-zinc-600 max-w-[180px] mt-1">
                    Press Q-P keys or click on harmonica cells to hear the rich reedy acoustic timbre!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Keyboard Help Manual */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <h4 className="font-bold text-zinc-200 text-xs font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Keyboard Playing Guide
            </h4>
            
            <div className="text-xs text-zinc-400 space-y-3 leading-relaxed">
              <div className="p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-850">
                <span className="text-zinc-300 font-bold block mb-1">🎹 Hole Mappings:</span>
                <p>Press adjacent QWERTY letters or numbers for holes 1-10:</p>
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {["1/Q", "2/W", "3/E", "4/R", "5/T", "6/Y", "7/U", "8/I", "9/O", "0/P"].map((cell, idx) => (
                    <span key={idx} className="bg-zinc-800 text-[10px] text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
                      {cell}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-850">
                <span className="text-zinc-300 font-bold block mb-1">💨 Inhaling / Drawing:</span>
                <p>
                  Press keys <strong className="text-amber-400">alone</strong> to Blow (Exhale).
                </p>
                <p className="mt-1">
                  Hold <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-mono text-[10px]">Spacebar</kbd> down while pressing keys to Draw (Inhale).
                </p>
              </div>

              <div className="p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-850">
                <span className="text-zinc-300 font-bold block mb-1">🌀 Pitch Bending:</span>
                <p>
                  Hold <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded font-mono text-[10px]">B Key</kbd> down to bend the notes (applicable on holes 1-6 draw, and holes 8-10 blow).
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
