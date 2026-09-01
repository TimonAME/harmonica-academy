export interface NoteDetails {
  note: string;
  freq: number;
}

// Map of standard notes and their typical frequencies (C4 to B7)
export const NOTE_FREQUENCIES: NoteDetails[] = [
  { note: "C4", freq: 261.63 },
  { note: "C#4", freq: 277.18 },
  { note: "D4", freq: 293.66 },
  { note: "D#4", freq: 311.13 },
  { note: "E4", freq: 329.63 },
  { note: "F4", freq: 349.23 },
  { note: "F#4", freq: 369.99 },
  { note: "G4", freq: 392.00 },
  { note: "G#4", freq: 415.30 },
  { note: "A4", freq: 440.00 },
  { note: "A#4", freq: 466.16 },
  { note: "B4", freq: 493.88 },
  
  { note: "C5", freq: 523.25 },
  { note: "C#5", freq: 554.37 },
  { note: "D5", freq: 587.33 },
  { note: "D#5", freq: 622.25 },
  { note: "E5", freq: 659.25 },
  { note: "F5", freq: 698.46 },
  { note: "F#5", freq: 739.99 },
  { note: "G5", freq: 783.99 },
  { note: "G#5", freq: 830.61 },
  { note: "A5", freq: 880.00 },
  { note: "A#5", freq: 907.63 }, // Alternate Bb5
  { note: "Bb5", freq: 932.33 },
  { note: "B5", freq: 987.77 },
  
  { note: "C6", freq: 1046.50 },
  { note: "C#6", freq: 1108.73 },
  { note: "D6", freq: 1174.66 },
  { note: "D#6", freq: 1244.51 },
  { note: "E6", freq: 1318.51 },
  { note: "F6", freq: 1396.91 },
  { note: "F#6", freq: 1479.98 },
  { note: "G6", freq: 1567.98 },
  { note: "G#6", freq: 1661.22 },
  { note: "A6", freq: 1760.00 },
  { note: "A#6", freq: 1864.66 },
  { note: "B6", freq: 1975.53 },

  { note: "C7", freq: 2093.00 },
  { note: "C#7", freq: 2217.46 },
  { note: "D7", freq: 2349.32 },
  { note: "E7", freq: 2637.02 },
  { note: "F#7", freq: 2959.96 },
  { note: "G7", freq: 3135.96 },
  { note: "A7", freq: 3520.00 }
];

export interface HarmonicaHoleConfig {
  hole: number;
  blowNote: string;
  drawNote: string;
  drawBends?: { note: string; level: number }[]; // level: 1 = ', 2 = '', 3 = '''
  blowBends?: { note: string; level: number }[];
}

// 10-Hole Richter Tuning layouts for standard keys
export const HARMONICA_KEYS: Record<string, HarmonicaHoleConfig[]> = {
  C: [
    { hole: 1, blowNote: "C4", drawNote: "D4", drawBends: [{ note: "C#4", level: 1 }] },
    { hole: 2, blowNote: "E4", drawNote: "G4", drawBends: [{ note: "F#4", level: 1 }, { note: "F4", level: 2 }] },
    { hole: 3, blowNote: "G4", drawNote: "B4", drawBends: [{ note: "A#4", level: 1 }, { note: "A4", level: 2 }, { note: "G#4", level: 3 }] },
    { hole: 4, blowNote: "C5", drawNote: "D5", drawBends: [{ note: "C#5", level: 1 }] },
    { hole: 5, blowNote: "E5", drawNote: "F5" },
    { hole: 6, blowNote: "G5", drawNote: "A5", drawBends: [{ note: "G#5", level: 1 }] },
    { hole: 7, blowNote: "C6", drawNote: "B5" },
    { hole: 8, blowNote: "E6", drawNote: "D6", blowBends: [{ note: "D#6", level: 1 }] },
    { hole: 9, blowNote: "G6", drawNote: "F6", blowBends: [{ note: "F#6", level: 1 }] },
    { hole: 10, blowNote: "C7", drawNote: "A6", blowBends: [{ note: "B6", level: 1 }, { note: "A#6", level: 2 }] }
  ],
  G: [
    { hole: 1, blowNote: "G4", drawNote: "A4", drawBends: [{ note: "G#4", level: 1 }] },
    { hole: 2, blowNote: "B4", drawNote: "D5", drawBends: [{ note: "C#5", level: 1 }, { note: "C5", level: 2 }] },
    { hole: 3, blowNote: "D5", drawNote: "F#5", drawBends: [{ note: "F5", level: 1 }, { note: "E5", level: 2 }, { note: "D#5", level: 3 }] },
    { hole: 4, blowNote: "G5", drawNote: "A5", drawBends: [{ note: "G#5", level: 1 }] },
    { hole: 5, blowNote: "B5", drawNote: "C6" },
    { hole: 6, blowNote: "D6", drawNote: "E6", drawBends: [{ note: "D#6", level: 1 }] },
    { hole: 7, blowNote: "G6", drawNote: "F#6" },
    { hole: 8, blowNote: "B6", drawNote: "A6", blowBends: [{ note: "A#6", level: 1 }] },
    { hole: 9, blowNote: "D7", drawNote: "C7", blowBends: [{ note: "C#7", level: 1 }] },
    { hole: 10, blowNote: "G7", drawNote: "E7", blowBends: [{ note: "F#7", level: 1 }, { note: "F7", level: 2 }] }
  ],
  A: [
    { hole: 1, blowNote: "A4", drawNote: "B4", drawBends: [{ note: "A#4", level: 1 }] },
    { hole: 2, blowNote: "C#5", drawNote: "E5", drawBends: [{ note: "D#5", level: 1 }, { note: "D5", level: 2 }] },
    { hole: 3, blowNote: "E5", drawNote: "G#5", drawBends: [{ note: "G5", level: 1 }, { note: "F#5", level: 2 }, { note: "F5", level: 3 }] },
    { hole: 4, blowNote: "A5", drawNote: "B5", drawBends: [{ note: "A#5", level: 1 }] },
    { hole: 5, blowNote: "C#6", drawNote: "D6" },
    { hole: 6, blowNote: "E6", drawNote: "F#6", drawBends: [{ note: "F6", level: 1 }] },
    { hole: 7, blowNote: "A6", drawNote: "G#6" },
    { hole: 8, blowNote: "C#7", drawNote: "B6", blowBends: [{ note: "C7", level: 1 }] },
    { hole: 9, blowNote: "E7", drawNote: "D6", blowBends: [{ note: "D#7", level: 1 }] }, // Approximated
    { hole: 10, blowNote: "A7", drawNote: "F#7", blowBends: [{ note: "G#7", level: 1 }, { note: "G7", level: 2 }] }
  ]
};

// Find the closest note to a given frequency
export function frequencyToNote(frequency: number): {
  note: string;
  frequency: number;
  cents: number;
} | null {
  if (frequency <= 0 || isNaN(frequency)) return null;

  let minDiff = Infinity;
  let closestNote: NoteDetails | null = null;

  for (const item of NOTE_FREQUENCIES) {
    const diff = Math.abs(frequency - item.freq);
    if (diff < minDiff) {
      minDiff = diff;
      closestNote = item;
    }
  }

  if (!closestNote) return null;

  // Calculate cents deviation: cents = 1200 * log2(f1 / f0)
  const cents = Math.round(
    1200 * Math.log2(frequency / closestNote.freq)
  );

  return {
    note: closestNote.note,
    frequency: closestNote.freq,
    cents: cents,
  };
}

// Map a note to a specific harmonica hole, isDraw, and bend details
export function findHoleForNote(
  noteName: string,
  key: string = "C",
  targetHole?: number,
  targetIsDraw?: boolean
): {
  hole: number;
  isDraw: boolean;
  isBend: boolean;
  bendLevel?: number;
} | null {
  const layout = HARMONICA_KEYS[key] || HARMONICA_KEYS.C;

  // First, if target context is provided, check if it matches the detected note Name!
  if (targetHole !== undefined && targetIsDraw !== undefined) {
    const targetConfig = layout.find(c => c.hole === targetHole);
    if (targetConfig) {
      // Check standard blow/draw target matches
      if (!targetIsDraw && targetConfig.blowNote.toLowerCase() === noteName.toLowerCase()) {
        return { hole: targetHole, isDraw: false, isBend: false };
      }
      if (targetIsDraw && targetConfig.drawNote.toLowerCase() === noteName.toLowerCase()) {
        return { hole: targetHole, isDraw: true, isBend: false };
      }

      // Check draw bends
      if (targetIsDraw && targetConfig.drawBends) {
        for (const bend of targetConfig.drawBends) {
          if (bend.note.toLowerCase() === noteName.toLowerCase()) {
            return { hole: targetHole, isDraw: true, isBend: true, bendLevel: bend.level };
          }
        }
      }

      // Check blow bends
      if (!targetIsDraw && targetConfig.blowBends) {
        for (const bend of targetConfig.blowBends) {
          if (bend.note.toLowerCase() === noteName.toLowerCase()) {
            return { hole: targetHole, isDraw: false, isBend: true, bendLevel: bend.level };
          }
        }
      }
    }
  }

  // Standard sequential lookup (fallback)
  for (const config of layout) {
    if (config.blowNote.toLowerCase() === noteName.toLowerCase()) {
      return { hole: config.hole, isDraw: false, isBend: false };
    }
    if (config.drawNote.toLowerCase() === noteName.toLowerCase()) {
      return { hole: config.hole, isDraw: true, isBend: false };
    }

    // Check draw bends
    if (config.drawBends) {
      for (const bend of config.drawBends) {
        if (bend.note.toLowerCase() === noteName.toLowerCase()) {
          return { hole: config.hole, isDraw: true, isBend: true, bendLevel: bend.level };
        }
      }
    }

    // Check blow bends
    if (config.blowBends) {
      for (const bend of config.blowBends) {
        if (bend.note.toLowerCase() === noteName.toLowerCase()) {
          return { hole: config.hole, isDraw: false, isBend: true, bendLevel: bend.level };
        }
      }
    }
  }

  return null;
}

// Find standard frequency for a specific tab note (for synthesis)
export function findFrequencyForTab(
  hole: number,
  isDraw: boolean,
  isBend: boolean = false,
  bendLevel: number = 0,
  key: string = "C"
): number {
  const layout = HARMONICA_KEYS[key] || HARMONICA_KEYS.C;
  const config = layout.find((c) => c.hole === hole);

  if (!config) return 440; // Fallback

  if (!isDraw && !isBend) {
    const note = NOTE_FREQUENCIES.find((n) => n.note === config.blowNote);
    return note ? note.freq : 440;
  }

  if (isDraw && !isBend) {
    const note = NOTE_FREQUENCIES.find((n) => n.note === config.drawNote);
    return note ? note.freq : 440;
  }

  if (isDraw && isBend && config.drawBends) {
    const bend = config.drawBends.find((b) => b.level === (bendLevel || 1));
    if (bend) {
      const note = NOTE_FREQUENCIES.find((n) => n.note === bend.note);
      return note ? note.freq : 440;
    }
  }

  if (!isDraw && isBend && config.blowBends) {
    const bend = config.blowBends.find((b) => b.level === (bendLevel || 1));
    if (bend) {
      const note = NOTE_FREQUENCIES.find((n) => n.note === bend.note);
      return note ? note.freq : 440;
    }
  }

  // Fallback
  const standardNote = isDraw ? config.drawNote : config.blowNote;
  const note = NOTE_FREQUENCIES.find((n) => n.note === standardNote);
  return note ? note.freq : 440;
}
