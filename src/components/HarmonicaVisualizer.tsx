import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { HARMONICA_KEYS } from "../utils/harmonicaNotes";

interface HarmonicaVisualizerProps {
  harmonicaKey?: string;
  activeHole: number | null; // Note currently being played by song/synth
  activeSecondHole?: number | null; // Optional second hole for double-tones
  activeIsDraw: boolean | null;
  detectedHole: number | null; // Note currently played by user (mic)
  detectedIsDraw: boolean | null;
  detectedPitchOffset?: number; // Cents sharp/flat for the tuner
  isCompact?: boolean;
}

export const HarmonicaVisualizer: React.FC<HarmonicaVisualizerProps> = ({
  harmonicaKey = "C",
  activeHole,
  activeSecondHole = null,
  activeIsDraw,
  detectedHole,
  detectedIsDraw,
  detectedPitchOffset = 0,
  isCompact = false,
}) => {
  const holes = Array.from({ length: 10 }, (_, i) => i + 1);
  const layout = HARMONICA_KEYS[harmonicaKey] || HARMONICA_KEYS.C;

  return (
    <div className={`w-full flex flex-col items-center select-none ${isCompact ? "gap-1" : ""}`} id="harmonica-visualizer">
      {/* Key Indicator & Legend */}
      {!isCompact && (
        <div className="w-full max-w-2xl flex justify-between items-center px-4 mb-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded-md font-bold">
              Key of {harmonicaKey} Diatonic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              Blow (Exhale)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block animate-pulse"></span>
              Draw (Inhale)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Your Pitch
            </span>
          </div>
        </div>
      )}

      {/* Main Harmonica Frame */}
      <div className={`relative w-full max-w-3xl bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-900 rounded-2xl border-4 border-zinc-700 shadow-2xl overflow-hidden flex flex-col justify-between p-1.5 ${
        isCompact ? "h-[105px]" : "h-44"
      }`}>
        
        {/* Metal Plate Glossy Accent */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-xl"></div>

        {/* Top Coverplate Blow Row Notes */}
        <div className="w-full flex justify-between px-3 text-[10px] font-mono text-zinc-400 select-none">
          {holes.map((h) => {
            const holeInfo = layout.find((l) => l.hole === h);
            const isSongActive = (activeHole === h || activeSecondHole === h) && !activeIsDraw;
            const isUserActive = detectedHole === h && !detectedIsDraw;

            return (
              <div
                key={`top-note-${h}`}
                className={`w-1/10 flex flex-col items-center transition-all duration-200 ${
                  isSongActive ? "text-amber-500 font-bold scale-110" : ""
                } ${isUserActive ? "text-emerald-400 font-extrabold" : ""}`}
              >
                {!isCompact && <span className="text-[9px]">Blow</span>}
                <span className={`${isCompact ? "text-xs font-bold" : "text-sm font-semibold"}`}>{holeInfo?.blowNote || "-"}</span>
                {isSongActive && <ArrowUp className={`${isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} text-amber-500 mt-0.5 animate-bounce`} />}
                {!isSongActive && isUserActive && <ArrowUp className={`${isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} text-emerald-400 mt-0.5`} />}
              </div>
            );
          })}
        </div>

        {/* Comb & Holes Block */}
        <div className={`w-full bg-zinc-950 rounded-lg flex relative border border-zinc-850 p-1 ${isCompact ? "h-11" : "h-18"}`}>
          {holes.map((h) => {
            const isSongActive = activeHole === h || activeSecondHole === h;
            const isSongBlow = isSongActive && !activeIsDraw;

            const isUserActive = detectedHole === h;

            // Determine hole state color styling
            let holeStyle = "bg-zinc-900 border-zinc-800 text-zinc-500";
            if (isSongActive) {
              holeStyle = isSongBlow
                ? "bg-amber-950/40 border-amber-500 shadow-[inset_0_0_12px_rgba(245,158,11,0.4)] text-amber-300"
                : "bg-zinc-850 border-zinc-700 shadow-[inset_0_0_12px_rgba(228,228,231,0.15)] text-zinc-300";
            }
            if (isUserActive) {
              holeStyle += " ring-2 ring-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
            }

            return (
              <div key={`comb-hole-${h}`} className="w-1/10 h-full px-0.5 flex">
                <div
                  className={`w-full h-full rounded flex flex-col justify-center items-center border transition-all duration-150 relative ${holeStyle}`}
                >
                  {/* Comb partitions / wooden dividers */}
                  {h < 10 && (
                    <div className={`absolute right-[-3px] bg-amber-900 border-r border-amber-950 rounded-sm z-10 shadow-md ${
                      isCompact ? "top-[-2px] bottom-[-2px] w-[3px]" : "top-[-4px] bottom-[-4px] w-[5px]"
                    }`}></div>
                  )}

                  {/* Hole Number */}
                  <span className={`font-bold ${isSongActive ? "scale-110 font-black" : ""} ${isCompact ? "text-xs" : "text-base"}`}>
                    {h}
                  </span>

                  {/* Mic Detection Aura */}
                  {isUserActive && (
                    <motion.div
                      layoutId="user-mic-pulse"
                      className="absolute inset-0 rounded border-2 border-emerald-400 pointer-events-none"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 0.4, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Coverplate Draw Row Notes */}
        <div className="w-full flex justify-between px-3 text-[10px] font-mono text-zinc-400 select-none">
          {holes.map((h) => {
            const holeInfo = layout.find((l) => l.hole === h);
            const isSongActive = (activeHole === h || activeSecondHole === h) && activeIsDraw;
            const isUserActive = detectedHole === h && detectedIsDraw;

            return (
              <div
                key={`bottom-note-${h}`}
                className={`w-1/10 flex flex-col-reverse items-center transition-all duration-200 ${
                  isSongActive ? "text-zinc-300 font-bold scale-110" : ""
                } ${isUserActive ? "text-emerald-400 font-extrabold" : ""}`}
              >
                {!isCompact && <span className="text-[9px]">Draw</span>}
                <span className={`${isCompact ? "text-xs font-bold" : "text-sm font-semibold"}`}>{holeInfo?.drawNote || "-"}</span>
                {isSongActive && <ArrowDown className={`${isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} text-zinc-300 mb-0.5 animate-bounce`} />}
                {!isSongActive && isUserActive && <ArrowDown className={`${isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} text-emerald-400 mb-0.5`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tuner Indicator Bar */}
      <AnimatePresence>
        {detectedHole !== null && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-between text-xs font-mono ${
              isCompact ? "px-3 py-1 mt-1.5" : "px-4 py-2 mt-4"
            }`}
            id="pitch-tuner-feedback"
          >
            <span className="text-zinc-400">Tuner:</span>
            <div className="flex-1 mx-3 flex items-center relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-600 z-10"></div>
              <motion.div
                className={`absolute top-0 bottom-0 w-3 rounded-full ${
                  Math.abs(detectedPitchOffset) < 15
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "bg-amber-500"
                }`}
                animate={{
                  left: `${Math.max(5, Math.min(95, 50 + detectedPitchOffset))}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
              />
            </div>
            <span
              className={`font-semibold ${
                Math.abs(detectedPitchOffset) < 15 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {detectedPitchOffset > 0 ? "+" : ""}
              {detectedPitchOffset} cents
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
