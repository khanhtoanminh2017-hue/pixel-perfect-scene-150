// Shared types for the game engine. Lesson content lives in src/game/lessons/*.
export type Level = "nb" | "th" | "vd"; // Nhận biết / Thông hiểu / Vận dụng

interface BaseQ {
  id: string;
  station: number; // index into lesson.stations
  level: Level;
  prompt: string;
  explanation: string;
  hint: string; // short knowledge tip shown on wrong answer
  review?: boolean; // teacher should verify detail
}
export interface McqQ extends BaseQ {
  type: "mcq";
  options: string[];
  icons?: string[]; // optional emoji per option (image-choice questions)
  answer: number;
}
export interface MatchQ extends BaseQ {
  type: "match";
  pairs: [string, string][];
}
export interface OrderQ extends BaseQ {
  type: "order";
  tokens: string[]; // correct order
}
export interface ClassifyQ extends BaseQ {
  type: "classify";
  bins: [string, string];
  items: { text: string; bin: 0 | 1 }[];
}
export type Question = McqQ | MatchQ | OrderQ | ClassifyQ;

export interface Station {
  name: string;
  topic: string;
  mechanic: string; // short instruction shown at station start
  token: string; // emoji lit on each correct answer
  memory: string; // memory fragment name
  bg: string; // image url
}

export interface Lesson {
  title: string;
  subtitle: string;
  credit: string;
  stations: Station[];
  questions: Question[];
}
