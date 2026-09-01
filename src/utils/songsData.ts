import { Song, Lesson, Achievement } from "../types";

export const SONGS_DATABASE: Song[] = [
  {
    id: "oh-susanna",
    title: "Oh! Susanna",
    description: "The absolute classic beginner tune. Perfect for practicing leaps between holes 4, 5, and 6.",
    difficulty: "easy",
    key: "C",
    category: "folk",
    tempo: 100,
    tabs: [
      { hole: 4, isDraw: false, duration: 1, lyrics: "Oh", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "I", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "went", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "to", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "Al-", noteName: "G5" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "a-", noteName: "A5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "ba-", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "ma", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "with", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "my", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "ban-", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "jo", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "on", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "my", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 2, lyrics: "knee!", noteName: "D5" },

      { hole: 4, isDraw: false, duration: 1, lyrics: "I", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "am", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "go-", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-ing", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "to", noteName: "G5" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "Lou-", noteName: "A5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-i-", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-si-", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "-an-", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "-a", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "my", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "true", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "love", noteName: "C5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "for", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "to", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "see.", noteName: "C5" },

      { hole: 5, isDraw: true, duration: 1, lyrics: "Oh,", noteName: "F5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Su-", noteName: "F5" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "-san-", noteName: "A5" },
      { hole: 6, isDraw: true, duration: 2, lyrics: "-na,", noteName: "A5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "oh", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "don't", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "you", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "cry", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 2, lyrics: "for", noteName: "D5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "me,", noteName: "D5" },

      { hole: 4, isDraw: false, duration: 1, lyrics: "For", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "I", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "come", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "from", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "Al-", noteName: "G5" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "-a-", noteName: "A5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-ba-", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ma", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "with", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "my", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "ban-", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "-jo", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "on", noteName: "C5" },
      { hole: 4, isDraw: false, duration: 3, lyrics: "my knee.", noteName: "C5" }
    ]
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    description: "A slow, elegant spiritual melody that helps you master long, steady breath control on draw notes.",
    difficulty: "easy",
    key: "C",
    category: "classic",
    tempo: 75,
    tabs: [
      { hole: 3, isDraw: false, duration: 1.5, lyrics: "A-", noteName: "G4" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "ma-", noteName: "C5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "zing", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "grace!", noteName: "C5" },
      { hole: 5, isDraw: false, duration: 1.5, lyrics: "how", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "sweet", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "the", noteName: "C5" },
      { hole: 3, isDraw: true, duration: 1, lyrics: "sound,", noteName: "B4" },
      { hole: 3, isDraw: false, duration: 1.5, lyrics: "that", noteName: "G4" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "saved", noteName: "C5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "a", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1.5, lyrics: "wretch", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "like", noteName: "D5" },
      { hole: 6, isDraw: false, duration: 3, lyrics: "me...", noteName: "G5" },

      { hole: 5, isDraw: false, duration: 1.5, lyrics: "I", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1.5, lyrics: "once", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "was", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1.5, lyrics: "lost,", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1.5, lyrics: "but", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "now", noteName: "C5" },
      { hole: 3, isDraw: false, duration: 2, lyrics: "am", noteName: "G4" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "found,", noteName: "C5" },
      { hole: 3, isDraw: false, duration: 1.5, lyrics: "Was", noteName: "G4" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "blind,", noteName: "C5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "but", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1.5, lyrics: "now", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "I", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 3, lyrics: "see.", noteName: "C5" }
    ]
  },
  {
    id: "ode-to-joy",
    title: "Ode to Joy",
    description: "Beethoven's masterpiece. Features simple, consecutive notes which are perfect for developing smooth blow/draw transition habits.",
    difficulty: "easy",
    key: "C",
    category: "classic",
    tempo: 90,
    tabs: [
      // Verse 1
      { hole: 5, isDraw: false, duration: 1, lyrics: "Joy-", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ful,", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "joy-", noteName: "F5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-ful,", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "we", noteName: "G5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "a-", noteName: "F5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-dore", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Thee,", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "God", noteName: "C5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "of", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "glo-", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ry,", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1.5, lyrics: "Lord", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "of", noteName: "D5" },
      { hole: 4, isDraw: true, duration: 2, lyrics: "love!", noteName: "D5" },

      // Verse 2
      { hole: 5, isDraw: false, duration: 1, lyrics: "Hearts", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "un-", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "-fold", noteName: "F5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "like", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "flow'rs", noteName: "G5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "be-", noteName: "F5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-fore", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Thee,", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "O-", noteName: "C5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "-p'ning", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "to", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "the", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "sun", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "a-", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "-bove.", noteName: "C5" },

      // Bridge
      { hole: 4, isDraw: true, duration: 1, lyrics: "Melt", noteName: "D5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "the", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "clouds", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "of", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "sin", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 0.5, lyrics: "and", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "sad-", noteName: "F5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ness,", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "drive", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "the", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 0.5, lyrics: "dark", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "of", noteName: "F5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "doubt", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "a-", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "-way;", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Giv-", noteName: "D5" },
      { hole: 3, isDraw: false, duration: 1, lyrics: "-er", noteName: "G4" },

      // Verse 3 (recap)
      { hole: 5, isDraw: false, duration: 1, lyrics: "Fi-", noteName: "E5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-lling", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "us", noteName: "F5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "with", noteName: "G5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "light", noteName: "G5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "of", noteName: "F5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "e-", noteName: "E5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "-ter-", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "-nal", noteName: "C5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "day,", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "fill", noteName: "D5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "us", noteName: "E5" },
      { hole: 4, isDraw: false, duration: 1.5, lyrics: "with", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "the", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "day!", noteName: "C5" }
    ]
  },
  {
    id: "blues-shuffle",
    title: "12-Bar Blues Shuffle Riff",
    description: "Welcome to the blues! Introduces drawing, quick breath changes, and the fundamental draw bend on hole 3 to create that crunchy blues sound.",
    difficulty: "medium",
    key: "C",
    category: "blues",
    tempo: 80,
    tabs: [
      // Bar 1-2 (G Riff)
      { hole: 2, isDraw: true, duration: 1, lyrics: "Chug", noteName: "G4" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "Bend", noteName: "Bb4" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Draw", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "Blow", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Draw", noteName: "D5" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "Bend", noteName: "Bb4" },
      { hole: 2, isDraw: true, duration: 2, lyrics: "Resolve", noteName: "G4" },

      // Bar 3-4 (G Riff Repeated)
      { hole: 2, isDraw: true, duration: 1, lyrics: "Chug", noteName: "G4" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "Bend", noteName: "Bb4" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Draw", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "Blow", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Draw", noteName: "D5" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "Bend", noteName: "Bb4" },
      { hole: 2, isDraw: true, duration: 2, lyrics: "G-Riff", noteName: "G4" },

      // Bar 5-6 (IV Chord C Riff)
      { hole: 4, isDraw: false, duration: 1, lyrics: "C-Blow", noteName: "C5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Draw", noteName: "F5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "Blow", noteName: "G5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "Blow", noteName: "E5" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "Blow", noteName: "G5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Draw", noteName: "F5" },
      { hole: 4, isDraw: false, duration: 2, lyrics: "C-Root", noteName: "C5" },

      // Bar 7-8 (I Chord G Riff)
      { hole: 2, isDraw: true, duration: 1, lyrics: "G-Back", noteName: "G4" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "Bend", noteName: "Bb4" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "Draw", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "Blow", noteName: "C5" },
      { hole: 4, isDraw: true, duration: 2, lyrics: "G-Res", noteName: "D5" },

      // Bar 9 (V Chord D Riff)
      { hole: 4, isDraw: true, duration: 1, lyrics: "D-Draw", noteName: "D5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Draw", noteName: "F5" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "High", noteName: "A5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Draw", noteName: "F5" },

      // Bar 10 (IV Chord C Riff)
      { hole: 4, isDraw: false, duration: 1, lyrics: "C-Blow", noteName: "C5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "Blow", noteName: "E5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "Draw", noteName: "F5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "C-Root", noteName: "C5" },

      // Bar 11-12 (Turnaround / Resolution)
      { hole: 2, isDraw: true, duration: 1, lyrics: "Turn-", noteName: "G4" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "-a-", noteName: "Bb4" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "-round", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "to", noteName: "C5" },
      { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 1, lyrics: "V", noteName: "Bb4" },
      { hole: 2, isDraw: true, duration: 3, lyrics: "Yeah!", noteName: "G4" }
    ]
  },
  {
    id: "red-river-valley",
    title: "Red River Valley",
    description: "An evocative campfire folk standard. Written in G Major, designed to be played on a Key of G harmonica for that rich sweet resonance.",
    difficulty: "easy",
    key: "G",
    category: "folk",
    tempo: 85,
    tabs: [
      { hole: 3, isDraw: false, duration: 1, lyrics: "From", noteName: "D5" },
      { hole: 3, isDraw: false, duration: 1, lyrics: "this", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "val-", noteName: "G5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "-ley", noteName: "A5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "they", noteName: "B5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "say", noteName: "B5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "you", noteName: "B5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "are", noteName: "A5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "go-", noteName: "B5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "-ing,", noteName: "G5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "we", noteName: "G5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "will", noteName: "A5" },
      { hole: 4, isDraw: true, duration: 2, lyrics: "miss...", noteName: "A5" },

      { hole: 4, isDraw: true, duration: 1, lyrics: "your", noteName: "A5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "bright", noteName: "A5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "eyes", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "and", noteName: "C6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "sweet", noteName: "E6" },
      { hole: 6, isDraw: true, duration: 1.5, lyrics: "smile,", noteName: "E6" },
      { hole: 6, isDraw: false, duration: 0.5, lyrics: "for", noteName: "D6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "they", noteName: "E6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "say", noteName: "D6" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "you", noteName: "B5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "are", noteName: "G5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "tak-", noteName: "A5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ing", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "the", noteName: "C6" },
      { hole: 5, isDraw: true, duration: 1, lyrics: "sun-", noteName: "C6" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-shine", noteName: "B5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "that", noteName: "A5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "has", noteName: "G5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "bright-", noteName: "A5" },
      { hole: 5, isDraw: false, duration: 1, lyrics: "-ened", noteName: "B5" },
      { hole: 4, isDraw: false, duration: 1, lyrics: "our", noteName: "G5" },
      { hole: 4, isDraw: true, duration: 1, lyrics: "path-", noteName: "A5" },
      { hole: 3, isDraw: false, duration: 1, lyrics: "-way", noteName: "D5" },
      { hole: 3, isDraw: false, duration: 1, lyrics: "for", noteName: "D5" },
      { hole: 3, isDraw: false, duration: 1, lyrics: "a", noteName: "D5" },
      { hole: 4, isDraw: false, duration: 3, lyrics: "while.", noteName: "G5" }
    ]
  },
  {
    id: "bella-ciao",
    title: "Bella Ciao",
    description: "An Italian protest folk song with a gorgeous minor-mode tempo. Styled for a Key of A harmonica, featuring high energy transitions.",
    difficulty: "hard",
    key: "A",
    category: "folk",
    tempo: 120,
    tabs: [
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "U-", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "-na", noteName: "D6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "mat-", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-ti-", noteName: "E6" },
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "-na,", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "mi", noteName: "D6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "son", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "sve-", noteName: "E6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "-glia-", noteName: "F#6" },
      { hole: 7, isDraw: true, duration: 1, lyrics: "-to,", noteName: "G#6" },
      { hole: 7, isDraw: false, duration: 1, lyrics: "o", noteName: "A6" },
      { hole: 7, isDraw: false, duration: 1, lyrics: "bel-", noteName: "A6" },
      { hole: 7, isDraw: true, duration: 0.5, lyrics: "-la", noteName: "G#6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "ciao!", noteName: "F#6" },

      { hole: 6, isDraw: true, duration: 0.5, lyrics: "o", noteName: "F#6" },
      { hole: 7, isDraw: false, duration: 0.5, lyrics: "bel-", noteName: "A6" },
      { hole: 7, isDraw: true, duration: 0.5, lyrics: "la", noteName: "G#6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "ciao,", noteName: "F#6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "o", noteName: "F#6" },
      { hole: 7, isDraw: false, duration: 0.5, lyrics: "bel-", noteName: "A6" },
      { hole: 7, isDraw: true, duration: 0.5, lyrics: "la", noteName: "G#6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "ciao,", noteName: "F#6" },
      { hole: 7, isDraw: false, duration: 0.5, lyrics: "ciao,", noteName: "A6" },
      { hole: 7, isDraw: true, duration: 0.5, lyrics: "ciao,", noteName: "G#6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "ciao,", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "ciao!", noteName: "E6" },

      { hole: 4, isDraw: true, duration: 0.5, lyrics: "U-", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "-na", noteName: "D6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "mat-", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-ti-", noteName: "E6" },
      { hole: 4, isDraw: true, duration: 0.5, lyrics: "-na,", noteName: "B5" },
      { hole: 5, isDraw: true, duration: 0.5, lyrics: "mi", noteName: "D6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "son", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "sve-", noteName: "E6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "-glia-", noteName: "F#6" },
      { hole: 7, isDraw: true, duration: 1, lyrics: "-to,", noteName: "G#6" },
      { hole: 7, isDraw: false, duration: 1, lyrics: "e", noteName: "A6" },
      { hole: 7, isDraw: false, duration: 1, lyrics: "ho", noteName: "A6" },
      { hole: 7, isDraw: true, duration: 0.5, lyrics: "tro-", noteName: "G#6" },
      { hole: 6, isDraw: true, duration: 0.5, lyrics: "-va-", noteName: "F#6" },
      { hole: 6, isDraw: false, duration: 1, lyrics: "-to", noteName: "E6" },
      { hole: 6, isDraw: true, duration: 1, lyrics: "l'in-", noteName: "F#6" },
      { hole: 7, isDraw: false, duration: 1, lyrics: "-va-", noteName: "A6" },
      { hole: 7, isDraw: false, duration: 2, lyrics: "-sor.", noteName: "A6" }
    ]
  },
  {
    id: "piano-man",
    title: "Piano Man (Refrain)",
    description: "The iconic vocal refrain ('Sing us a song, you're the piano man...') from Billy Joel's masterpiece, played in beautiful full-sounding double-stops (split chords).",
    difficulty: "medium",
    key: "C",
    category: "pop",
    tempo: 160,
    tabs: [
      // Line 1: 56 -56 56 -45 45 -45 45  (3 measures of 3/4)
      { hole: 5, secondHole: 6, isDraw: false, duration: 1.5, lyrics: "Sing", noteName: "E5 & G5" },
      { hole: 5, secondHole: 6, isDraw: true, duration: 0.5, lyrics: "us", noteName: "F5 & A5" },
      { hole: 5, secondHole: 6, isDraw: false, duration: 1.0, lyrics: "a", noteName: "E5 & G5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 2.0, lyrics: "song,", noteName: "D5 & F5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 1.0, lyrics: "you're", noteName: "C5 & E5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 1.0, lyrics: "the", noteName: "D5 & F5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 2.0, lyrics: "pi-", noteName: "C5 & E5" },

      // Line 2: 34 -34 45 -34 45 -45  (2 measures of 3/4)
      { hole: 3, secondHole: 4, isDraw: false, duration: 0.5, lyrics: "-an-", noteName: "G4 & C5" },
      { hole: 3, secondHole: 4, isDraw: true, duration: 0.5, lyrics: "-o", noteName: "B4 & D5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 2.0, lyrics: "man,", noteName: "C5 & E5" },
      { hole: 3, secondHole: 4, isDraw: true, duration: 1.0, lyrics: "Sing", noteName: "B4 & D5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 1.0, lyrics: "us", noteName: "C5 & E5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 1.0, lyrics: "a", noteName: "D5 & F5" },

      // Line 3: 56 -56 56 -45 45 -45 45  (mirrors Line 1, 3 measures of 3/4)
      { hole: 5, secondHole: 6, isDraw: false, duration: 1.5, lyrics: "song", noteName: "E5 & G5" },
      { hole: 5, secondHole: 6, isDraw: true, duration: 0.5, lyrics: "to-", noteName: "F5 & A5" },
      { hole: 5, secondHole: 6, isDraw: false, duration: 1.0, lyrics: "-night.", noteName: "E5 & G5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 2.0, lyrics: "Well,", noteName: "D5 & F5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 1.0, lyrics: "we're", noteName: "C5 & E5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 1.0, lyrics: "all", noteName: "D5 & F5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 2.0, lyrics: "in", noteName: "C5 & E5" },

      // Line 4: 34 -45 45 -34 34  (final held note as song-ending fermata)
      { hole: 3, secondHole: 4, isDraw: false, duration: 1.0, lyrics: "the", noteName: "G4 & C5" },
      { hole: 4, secondHole: 5, isDraw: true, duration: 1.5, lyrics: "mood", noteName: "D5 & F5" },
      { hole: 4, secondHole: 5, isDraw: false, duration: 0.5, lyrics: "for", noteName: "C5 & E5" },
      { hole: 3, secondHole: 4, isDraw: true, duration: 1.0, lyrics: "a", noteName: "B4 & D5" },
      { hole: 3, secondHole: 4, isDraw: false, duration: 4.0, lyrics: "mel-o-dy...", noteName: "G4 & C5" }
    ]
  }
];

export const LESSONS_DATABASE: Lesson[] = [
  {
    id: "lesson-1-embouchure",
    title: "1. The Single Note Embouchure",
    description: "Learn how to shape your lips and isolate a single hole (Hole 4) to play a clean, clear note.",
    durationMinutes: 5,
    difficulty: "easy",
    icon: "lip",
    steps: [
      {
        title: "Pucker Your Lips",
        instruction: "Imagine whistler lips or sipping hot coffee through a thin straw. Place the harmonica deep in your mouth, resting on your lower lip, and tilt it slightly upward.",
        diagramType: "single-note",
        targetHole: 4,
        targetIsDraw: false,
        targetNote: "C5",
        practiceTab: [
          { hole: 4, isDraw: false, duration: 4, lyrics: "Blow steady...", noteName: "C5" }
        ]
      },
      {
        title: "Find Hole 4",
        instruction: "Hole 4 is the beginner's home. Gently blow air into Hole 4. Try to block out air from Holes 3 and 5. Listen to the steady pitch of C5.",
        diagramType: "single-note",
        targetHole: 4,
        targetIsDraw: false,
        targetNote: "C5",
        practiceTab: [
          { hole: 4, isDraw: false, duration: 2, lyrics: "Blow", noteName: "C5" },
          { hole: 4, isDraw: false, duration: 2, lyrics: "Blow", noteName: "C5" }
        ]
      }
    ]
  },
  {
    id: "lesson-2-breathing",
    title: "2. Breathing & Smooth Transitions",
    description: "Master the art of inhaling (Draw) and exhaling (Blow) fluidly without losing your single-note embouchure.",
    durationMinutes: 8,
    difficulty: "easy",
    icon: "wind",
    steps: [
      {
        title: "The Inhale (Draw Note)",
        instruction: "Instead of blowing, gently breathe in through the harmonica on Hole 4. This produces a D5 note. Keep your shoulders relaxed and breathe from your diaphragm.",
        diagramType: "blow-draw",
        targetHole: 4,
        targetIsDraw: true,
        targetNote: "D5",
        practiceTab: [
          { hole: 4, isDraw: true, duration: 4, lyrics: "Inhale steady...", noteName: "D5" }
        ]
      },
      {
        title: "The Blow-Draw Switch",
        instruction: "Now, alternate between blowing (exhaling) and drawing (inhaling) on Hole 4. Keep your lips locked in position. Listen for the smooth transition.",
        diagramType: "blow-draw",
        targetHole: 4,
        targetIsDraw: false,
        targetNote: "C5",
        practiceTab: [
          { hole: 4, isDraw: false, duration: 2, lyrics: "Exhale (Blow)", noteName: "C5" },
          { hole: 4, isDraw: true, duration: 2, lyrics: "Inhale (Draw)", noteName: "D5" },
          { hole: 4, isDraw: false, duration: 2, lyrics: "Exhale (Blow)", noteName: "C5" },
          { hole: 4, isDraw: true, duration: 2, lyrics: "Inhale (Draw)", noteName: "D5" }
        ]
      }
    ]
  },
  {
    id: "lesson-3-bending",
    title: "3. Intro to Bending Notes",
    description: "The secret of blues harmonica. Learn how to restrict the airflow to draw a note sharp down into a sexy, expressive blues tone.",
    durationMinutes: 12,
    difficulty: "medium",
    icon: "music",
    steps: [
      {
        title: "The Draw Bend Tongue Slide",
        instruction: "Select Hole 3 Draw. Inhale standardly to get a crisp B4. Then, pull the arch of your tongue backward and upward (like saying 'Oy' or 'Kee') to make the air flow downward. This pulls the pitch down to Bb4!",
        diagramType: "bending",
        targetHole: 3,
        targetIsDraw: true,
        targetNote: "A#4",
        practiceTab: [
          { hole: 3, isDraw: true, isBend: true, bendLevel: 1, duration: 4, lyrics: "Bend down...", noteName: "A#4" }
        ]
      }
    ]
  }
];

export const ACHIEVEMENTS_DATABASE: Achievement[] = [
  {
    id: "first-step",
    title: "First Breath",
    description: "Launch the harmonica academy and complete your first pitch check.",
    icon: "wind",
    requirementType: "points",
    requirementValue: 10
  },
  {
    id: "clean-player",
    title: "Isolator Pro",
    description: "Achieve an accuracy score of 85% or higher on any practice session.",
    icon: "target",
    requirementType: "accuracy",
    requirementValue: 85
  },
  {
    id: "streak-3",
    title: "Consistent Whistler",
    description: "Maintain a daily practice streak of 3 days.",
    icon: "zap",
    requirementType: "streak",
    requirementValue: 3
  },
  {
    id: "song-master",
    title: "Campfire Legend",
    description: "Practice at least 3 unique songs/riffs successfully.",
    icon: "award",
    requirementType: "songs",
    requirementValue: 3
  },
  {
    id: "maestro",
    title: "Harmonica Virtuoso",
    description: "Accumulate 500 total skill points in the academy.",
    icon: "crown",
    requirementType: "points",
    requirementValue: 500
  }
];
