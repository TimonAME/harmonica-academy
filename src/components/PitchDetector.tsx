import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  AlertCircle, 
  Sparkles, 
  Play, 
  Square, 
  Activity, 
  Radio, 
  ArrowRight,
  Sparkle,
  Volume2,
  VolumeX
} from "lucide-react";
import { PitchDetectionSession } from "../utils/pitchDetector";
import { frequencyToNote, findHoleForNote } from "../utils/harmonicaNotes";

interface PitchDetectorProps {
  harmonicaKey: string;
  isMicActive: boolean;
  toggleMic: () => void;
  micError: string | null;
  liveFreq: number;
  liveNote: string | null;
  centsOffset: number;
  detectedHole: { hole: number; isDraw: boolean; isBend: boolean; bendLevel?: number } | null;
  
  // Mic Follow / Practice Mode props
  playMode: "autoplay" | "practice";
  onPlayModeChange: (mode: "autoplay" | "practice") => void;
  isPlaying: boolean;
  activeCountdown: number | null;
  onStartPractice: () => void;
  onStopPractice: () => void;
  targetHole: number | null;
  targetSecondHole?: number | null;
  targetIsDraw: boolean | null;
  
  // Success sound mute props
  isSuccessSoundMuted: boolean;
  onToggleSuccessSoundMute: () => void;
  isCompact?: boolean;
}

export const PitchDetector: React.FC<PitchDetectorProps> = ({
  harmonicaKey,
  isMicActive,
  toggleMic,
  micError,
  liveFreq,
  liveNote,
  centsOffset,
  detectedHole,
  playMode,
  onPlayModeChange,
  isPlaying,
  activeCountdown,
  onStartPractice,
  onStopPractice,
  targetHole,
  targetSecondHole = null,
  targetIsDraw,
  isSuccessSoundMuted,
  onToggleSuccessSoundMute,
  isCompact = false,
}) => {
  const isCurrentNoteMatching = 
    isPlaying &&
    targetHole !== null &&
    detectedHole !== null &&
    ((detectedHole.hole === targetHole && detectedHole.isDraw === targetIsDraw) ||
     (targetSecondHole !== null && detectedHole.hole === targetSecondHole && detectedHole.isDraw === targetIsDraw));

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col ${
        isCompact ? "p-3 gap-3" : "p-5 gap-5"
      }`}
      id="pitch-detector-widget"
    >
      {/* Header Info */}
      <div className={`flex justify-between items-center border-b border-zinc-800/80 ${isCompact ? "pb-2" : "pb-4"}`}>
        <div>
          <h3 className="font-bold text-zinc-100 text-sm font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Live Tuner
          </h3>
          {!isCompact && <p className="text-[11px] text-zinc-400">Microphone Autocorrelation Tuner</p>}
        </div>

        <button
          onClick={toggleMic}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isMicActive
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30"
              : "bg-zinc-850 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
          id="mic-toggler"
          title={isMicActive ? "Disable Microphone" : "Enable Microphone"}
        >
          {isMicActive ? (
            <>
              <Mic className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>On</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Off</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 flex gap-2 text-xs text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tuner Ring Panel */}
      <div className={`bg-zinc-950/45 border border-zinc-800/60 rounded-xl flex flex-col items-center justify-center relative overflow-hidden ${
        isCompact ? "min-h-[105px] p-2" : "min-h-[140px] p-4"
      }`}>
        {/* Background ambient glow if matching */}
        {isCurrentNoteMatching && (
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
        )}

        {isMicActive ? (
          <div className="flex flex-col items-center text-center w-full">
            {liveFreq > 0 && liveNote ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center w-full"
              >
                {/* Visual Circle Meter */}
                <div className={`rounded-full flex flex-col justify-center items-center shadow-lg transition-all duration-300 ${
                  isCompact ? "w-14 h-14" : "w-20 h-20"
                } ${
                  isCurrentNoteMatching 
                    ? "bg-emerald-950/50 border-2 border-emerald-400 shadow-emerald-500/20"
                    : "bg-zinc-900 border border-zinc-800 shadow-black/40"
                }`}>
                  <span className={`font-black tracking-tight transition-colors duration-300 ${
                    isCompact ? "text-lg leading-none" : "text-2xl"
                  } ${
                    isCurrentNoteMatching ? "text-emerald-400" : "text-zinc-200"
                  }`}>
                    {liveNote}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {liveFreq} Hz
                  </span>
                </div>

                {/* Harmonca Hole Mapping */}
                {detectedHole ? (
                  <div className={`flex flex-col items-center ${isCompact ? "mt-1.5" : "mt-3"}`}>
                    <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isCurrentNoteMatching 
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-zinc-800 text-zinc-300"
                    }`}>
                      Hole {detectedHole.hole} {detectedHole.isDraw ? "Draw" : "Blow"}
                    </span>
                    {detectedHole.isBend && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 mt-0.5 rounded font-mono uppercase tracking-wider font-bold">
                        Bending
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Out of range (Key {harmonicaKey})
                  </span>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="flex gap-1 items-center h-8 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-emerald-500/40 rounded-full"
                      animate={{ height: [6, 18, 6] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.12,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  Listening for C Harmonica notes...
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 max-w-[200px]">
                  Play a clean, single-tone note into your microphone
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center max-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2.5">
              <MicOff className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Tuner Inactive
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
              Activate your microphone feedback or start follow mode below to enable real-time pitch detection.
            </p>
          </div>
        )}
      </div>

      {/* Mode Controls & Practice Module Card */}
      <div className={`bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex flex-col ${
        isCompact ? "p-2.5 gap-2.5" : "p-4 gap-4"
      }`}>
        {/* Play Mode Switcher */}
        <div className="flex flex-col gap-1.5">
          {!isCompact && (
            <label className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">
              Practice Control Center
            </label>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => {
                onPlayModeChange("autoplay");
                if (isPlaying) onStopPractice();
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                playMode === "autoplay"
                  ? "bg-amber-500 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Auto Play</span>
            </button>
            <button
              onClick={() => {
                onPlayModeChange("practice");
                if (isPlaying) onStopPractice();
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                playMode === "practice"
                  ? "bg-emerald-600 text-zinc-50 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Mic Follow</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on selected Play Mode */}
        <div className={`border-t border-zinc-900/80 flex flex-col ${isCompact ? "pt-2 gap-2" : "pt-3 gap-3"}`}>
          {playMode === "autoplay" ? (
            <div className="text-xs text-zinc-400 leading-normal flex flex-col gap-1">
              {!isCompact ? (
                <p>
                  <strong>Auto Play Mode:</strong> Accompaniment scroll. Use the controls on the tabs panel to start, pause, or change tempo speed.
                </p>
              ) : (
                <p className="text-[11px]">
                  <strong>Auto Play:</strong> Auto scroll mode active.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {/* If Countdown Active */}
              {activeCountdown !== null ? (
                <div className={`flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-lg text-center ${
                  isCompact ? "p-2" : "p-3"
                }`}>
                  <motion.div
                    key={activeCountdown}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${isCompact ? "w-9 h-9 text-base" : "w-12 h-12 text-xl"} rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black font-mono shadow-lg shadow-amber-500/20`}
                  >
                    {activeCountdown}
                  </motion.div>
                  <p className="text-xs font-semibold text-amber-300 mt-1">Get ready to play!</p>
                </div>
              ) : isPlaying ? (
                /* If Playing/Listening */
                <div className="flex flex-col gap-2">
                  {/* Glowing listening status */}
                  <div className={`flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg ${
                    isCompact ? "p-2" : "p-3"
                  }`}>
                    <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-400 leading-none mb-0.5">Mic Follow Active</p>
                      {!isCompact && <p className="text-[10px] text-zinc-500">Waiting for you to play notes...</p>}
                    </div>
                  </div>

                  {/* Heads-up Target Display */}
                  {targetHole !== null && (
                    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg flex justify-between items-center ${
                      isCompact ? "p-2" : "p-3"
                    }`}>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold leading-none mb-1">
                          {targetSecondHole ? "Target Double-Tone" : "Target Note"}
                        </span>
                        <span className="text-xs font-bold text-zinc-300">
                          {targetSecondHole 
                            ? `Holes ${targetHole} & ${targetSecondHole} ${targetIsDraw ? "Draw (-)" : "Blow (+)"}`
                            : `Hole ${targetHole} ${targetIsDraw ? "Draw (-)" : "Blow (+)"}`}
                        </span>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-black ${
                        targetIsDraw 
                          ? "bg-indigo-950/50 text-indigo-400 border border-indigo-500/30" 
                          : "bg-amber-950/50 text-amber-400 border border-amber-500/30"
                      }`}>
                        {targetSecondHole 
                          ? (targetIsDraw ? `-${targetHole}, -${targetSecondHole}` : `${targetHole}, ${targetSecondHole}`)
                          : (targetIsDraw ? `-${targetHole}` : targetHole)}
                      </div>
                    </div>
                  )}

                  {/* Stop Practice Button & Mute success chime button */}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={onStopPractice}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/10 transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Practice Mode</span>
                    </button>
                    
                    <button
                      onClick={onToggleSuccessSoundMute}
                      className={`px-3 py-2 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isSuccessSoundMuted
                          ? "bg-rose-950/20 border-rose-800 text-rose-400 hover:bg-rose-950/40"
                          : "bg-zinc-850 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                      title={isSuccessSoundMuted ? "Unmute correct note chime" : "Mute correct note chime"}
                    >
                      {isSuccessSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
                    </button>
                  </div>
                </div>
              ) : (
                /* Idle, ready to start */
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    The scroller will pause on each note and only advance once you play the correct pitch on your C harmonica.
                  </p>
                  
                  <div className="flex gap-2 w-full mt-1.5">
                    <button
                      onClick={onStartPractice}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15 border border-emerald-500/30 transition-all active:scale-[0.98]"
                    >
                      <Activity className="w-4 h-4 text-emerald-100" />
                      <span>Start Mic Follow Practice</span>
                    </button>

                    <button
                      onClick={onToggleSuccessSoundMute}
                      className={`px-3 py-2.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isSuccessSoundMuted
                          ? "bg-rose-950/20 border-rose-800 text-rose-400 hover:bg-rose-950/40"
                          : "bg-zinc-850 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                      title={isSuccessSoundMuted ? "Unmute correct note chime" : "Mute correct note chime"}
                    >
                      {isSuccessSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
