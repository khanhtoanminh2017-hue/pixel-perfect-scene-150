// Pure game logic: no React, no DOM. Covered by src/test/engine.test.ts.
import type { Question } from "./types";

export const POINTS = 10;

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `perStation` questions from each chosen station, shuffled within station, stations in order. */
export function buildQueue(bank: Question[], stations: number[], perStation: number, rnd: () => number = Math.random): Question[] {
  return [...stations].sort((a, b) => a - b).flatMap((s) => shuffle(bank.filter((q) => q.station === s), rnd).slice(0, perStation));
}

export type Response = number | number[] | string[] | (0 | 1)[];

export function checkAnswer(q: Question, r: Response): boolean {
  switch (q.type) {
    case "mcq":
      return r === q.answer;
    case "match":
      // r[i] = index of the right-hand item paired with left item i
      return Array.isArray(r) && r.length === q.pairs.length && (r as number[]).every((v, i) => v === i);
    case "order":
      return Array.isArray(r) && r.length === q.tokens.length && (r as string[]).every((t, i) => t === q.tokens[i]);
    case "classify":
      return Array.isArray(r) && r.length === q.items.length && (r as number[]).every((b, i) => b === q.items[i].bin);
  }
}

/** Two wrong mcq option indexes to remove (50/50). */
export function fiftyFifty(q: Question, rnd: () => number = Math.random): number[] {
  if (q.type !== "mcq") return [];
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  return shuffle(wrong, rnd).slice(0, 2);
}

export interface Rank { title: string; note: string }
/** Ranks defined on a 200-point scale; other lengths are scaled. */
export function rankFor(score: number, max: number): Rank {
  const s = max > 0 ? Math.round((score / max) * 200) : 0;
  if (s >= 180) return { title: "Nhà khám phá xuất sắc", note: "Em đã thắp sáng trọn vẹn miền ký ức quê hương!" };
  if (s >= 140) return { title: "Người gìn giữ ký ức", note: "Rất tốt! Chỉ còn vài mảnh nhỏ cần ôn lại." };
  if (s >= 100) return { title: "Người khám phá triển vọng", note: "Hành trình đầy hứa hẹn – hãy ôn lại phần còn thiếu." };
  return { title: "Hãy tiếp tục hành trình", note: "Đừng nản lòng! Ôn bài và lên tàu thêm lần nữa nhé." };
}

// ================= Team match =================
export interface Team { name: string; score: number; pos: number; fifty: boolean; time: boolean }
export interface TeamState {
  phase: "play" | "feedback" | "tiebreak" | "done";
  teams: [Team, Team];
  queue: Question[];
  index: number;
  turn: 0 | 1;
  answered: boolean;
  lastCorrect: boolean | null;
  eliminated: number[];
  tiePool: Question[];
  tieIndex: number;
  tieRound: [boolean | null, boolean | null];
  winner: 0 | 1 | "draw" | null;
}

export type TeamAction =
  | { type: "answer"; correct: boolean }
  | { type: "next" }
  | { type: "skip" }
  | { type: "fifty"; remove: number[] }
  | { type: "time" };

export function initTeam(names: [string, string], queue: Question[], tiePool: Question[]): TeamState {
  const t = (name: string): Team => ({ name, score: 0, pos: 0, fifty: true, time: true });
  return { phase: "play", teams: [t(names[0]), t(names[1])], queue, index: 0, turn: 0, answered: false, lastCorrect: null, eliminated: [], tiePool, tieIndex: 0, tieRound: [null, null], winner: null };
}

export function currentQuestion(s: TeamState): Question | undefined {
  return s.phase === "tiebreak" || (s.phase === "feedback" && s.index >= s.queue.length) ? s.tiePool[s.tieIndex] : s.queue[s.index];
}

function finishMain(s: TeamState): TeamState {
  const [a, b] = s.teams;
  if (a.score !== b.score) return { ...s, phase: "done", winner: a.score > b.score ? 0 : 1 };
  if (s.tiePool.length === 0) return { ...s, phase: "done", winner: "draw" };
  return { ...s, phase: "tiebreak", turn: 0, answered: false, lastCorrect: null, eliminated: [], tieIndex: 0, tieRound: [null, null] };
}

export function teamReducer(s: TeamState, a: TeamAction): TeamState {
  if (s.phase === "done") return s;
  const inTie = s.index >= s.queue.length;
  switch (a.type) {
    case "answer": {
      if (s.answered || (s.phase !== "play" && s.phase !== "tiebreak")) return s; // lock: no double scoring
      const teams = s.teams.map((t, i) =>
        i === s.turn && a.correct && !inTie ? { ...t, score: t.score + POINTS, pos: t.pos + 1 } : t,
      ) as [Team, Team];
      const tieRound = [...s.tieRound] as TeamState["tieRound"];
      if (inTie) tieRound[s.turn] = a.correct;
      return { ...s, teams, answered: true, lastCorrect: a.correct, phase: "feedback", tieRound };
    }
    case "skip":
    case "next": {
      if (a.type === "next" && !s.answered) return s;
      if (!inTie) {
        const index = s.index + 1;
        const base = { ...s, index, turn: (index % 2) as 0 | 1, answered: false, lastCorrect: null, eliminated: [], phase: "play" as const };
        return index >= s.queue.length ? finishMain(base) : base;
      }
      // tie-break: team 0 then team 1 per round, each with its own question
      const tieIndex = s.tieIndex + 1;
      let tieRound = s.tieRound;
      if (s.turn === 1) {
        const [x, y] = tieRound;
        if (x !== y && x !== null && y !== null) return { ...s, phase: "done", winner: x ? 0 : 1 };
        tieRound = [null, null];
      }
      if (tieIndex >= s.tiePool.length || (s.turn === 0 && tieIndex >= s.tiePool.length)) return { ...s, phase: "done", winner: "draw" };
      return { ...s, tieIndex, tieRound, turn: s.turn === 0 ? 1 : 0, answered: false, lastCorrect: null, eliminated: [], phase: "tiebreak" };
    }
    case "fifty": {
      const t = s.teams[s.turn];
      if (!t.fifty || s.answered || a.remove.length === 0) return s;
      const teams = s.teams.map((x, i) => (i === s.turn ? { ...x, fifty: false } : x)) as [Team, Team];
      return { ...s, teams, eliminated: a.remove };
    }
    case "time": {
      const t = s.teams[s.turn];
      if (!t.time || s.answered) return s;
      const teams = s.teams.map((x, i) => (i === s.turn ? { ...x, time: false } : x)) as [Team, Team];
      return { ...s, teams };
    }
  }
}
