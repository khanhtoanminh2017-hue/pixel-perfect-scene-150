// Teacher settings + editable question bank, persisted in localStorage (no backend).
import { useSyncExternalStore } from "react";
import { lesson } from "./lessons/nguvan6-bai4";
import type { Question } from "./types";

export interface Settings { timer: number; perStation: number; stations: number[]; teamNames: [string, string] }
const DEFAULTS: Settings = { timer: 30, perStation: 4, stations: [0, 1, 2, 3, 4], teamNames: ["Đội Tre Xanh", "Đội Lúa Vàng"] };
const SK = "hvmku.settings.v1";
const QK = "hvmku.bank.v1";

let settings: Settings = DEFAULTS;
let bank: Question[] = lesson.questions;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const s = localStorage.getItem(SK);
    if (s) settings = { ...DEFAULTS, ...JSON.parse(s) };
    const q = localStorage.getItem(QK);
    if (q) bank = JSON.parse(q);
  } catch { /* ignore corrupt storage */ }
}
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { load(); subs.add(f); queueMicrotask(f); return () => { subs.delete(f); }; };

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => settings, () => DEFAULTS);
}
export function useBank(): Question[] {
  return useSyncExternalStore(subscribe, () => bank, () => lesson.questions);
}
export function saveSettings(p: Partial<Settings>) {
  settings = { ...settings, ...p };
  localStorage.setItem(SK, JSON.stringify(settings));
  emit();
}
export function saveQuestion(q: Question) {
  bank = bank.map((x) => (x.id === q.id ? q : x));
  localStorage.setItem(QK, JSON.stringify(bank));
  emit();
}
export function resetBank() {
  bank = lesson.questions;
  localStorage.removeItem(QK);
  emit();
}
export function resetSettings() {
  settings = DEFAULTS;
  localStorage.removeItem(SK);
  emit();
}
