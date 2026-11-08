import { useState } from "react";
import { cn } from "@/lib/utils";
import { checkAnswer, shuffle, type Response } from "@/game/engine";
import type { Question } from "@/game/types";
import { GButton } from "./ui";

const LEVEL = { nb: "Nhận biết", th: "Thông hiểu", vd: "Vận dụng" } as const;

interface Props {
  q: Question;
  locked: boolean; // answered or paused
  reveal: boolean; // show correct answer + explanation
  lastCorrect?: boolean | null;
  eliminated?: number[];
  onSubmit: (correct: boolean) => void;
}

/** Renders any question type on a paper scroll. Mount with key={q.id} to reset. */
export function QuestionScroll({ q, locked, reveal, lastCorrect, eliminated = [], onSubmit }: Props) {
  const submit = (r: Response) => { if (!locked) onSubmit(checkAnswer(q, r)); };
  return (
    <div className={cn("paper-scroll animate-unfurl mx-auto w-full max-w-5xl rounded-3xl p-5 md:p-8", reveal && lastCorrect && "animate-glow", reveal && lastCorrect === false && "animate-shake-soft")}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-70">
        <span>{LEVEL[q.level]}</span>
      </div>
      <h2 className="font-display text-2xl font-bold leading-snug md:text-4xl">{q.prompt}</h2>
      <div className="mt-5">
        {q.type === "mcq" && <Mcq q={q} locked={locked} reveal={reveal} eliminated={eliminated} onPick={submit} />}
        {q.type === "match" && <Match q={q} locked={locked} reveal={reveal} onDone={submit} />}
        {q.type === "order" && <Order q={q} locked={locked} reveal={reveal} onDone={submit} />}
        {q.type === "classify" && <Classify q={q} locked={locked} reveal={reveal} onDone={submit} />}
      </div>
      {reveal && (
        <div className={cn("animate-pop mt-5 rounded-2xl border-2 p-4 text-lg md:text-xl", lastCorrect ? "border-success bg-success/15" : "border-lacquer bg-lacquer/10")}>
          <div className="font-bold">{lastCorrect ? "✨ Chính xác! +10 điểm" : "Chưa đúng rồi – cùng xem lại nhé"}</div>
          <p className="mt-1">{q.explanation}</p>
          {!lastCorrect && <p className="mt-1 italic">💡 Gợi ý ôn tập: {q.hint}</p>}
        </div>
      )}
    </div>
  );
}

const optBase = "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition-all md:text-2xl";
const optIdle = "border-ink/20 bg-paper hover:border-lacquer hover:bg-gold/20";

function Mcq({ q, locked, reveal, eliminated, onPick }: { q: Extract<Question, { type: "mcq" }>; locked: boolean; reveal: boolean; eliminated: number[]; onPick: (i: number) => void }) {
  const [order] = useState(() => shuffle(q.options.map((_, i) => i)));
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {order.map((i, k) => {
        const gone = eliminated.includes(i);
        const isAns = reveal && i === q.answer;
        const isWrongPick = reveal && picked === i && i !== q.answer;
        return (
          <button key={i} disabled={locked || gone} onClick={() => { setPicked(i); onPick(i); }}
            className={cn(optBase, optIdle, gone && "invisible", isAns && "border-success bg-success/25", isWrongPick && "border-lacquer bg-lacquer/15", locked && !isAns && !isWrongPick && "opacity-70")}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-display text-paper">{"ABCD"[k]}</span>
            {q.icons && <span className="text-4xl">{q.icons[i]}</span>}
            <span>{q.options[i]}</span>
          </button>
        );
      })}
    </div>
  );
}

const PAIR_COLORS = ["bg-gold/50", "bg-jade/40", "bg-lacquer/30", "bg-primary/30"];

function Match({ q, locked, reveal, onDone }: { q: Extract<Question, { type: "match" }>; locked: boolean; reveal: boolean; onDone: (r: number[]) => void }) {
  const [right] = useState(() => shuffle(q.pairs.map((_, i) => i)));
  const [sel, setSel] = useState<number | null>(null);
  const [map, setMap] = useState<Record<number, number>>({}); // left -> right original idx
  const usedRight = new Set(Object.values(map));
  const complete = Object.keys(map).length === q.pairs.length;
  const colorOfLeft = (l: number) => PAIR_COLORS[l % PAIR_COLORS.length];
  const leftOfRight = (r: number) => Number(Object.keys(map).find((l) => map[+l] === r) ?? -1);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <div className="space-y-3">
          {q.pairs.map(([l], i) => (
            <button key={i} disabled={locked} onClick={() => { setSel(i); setMap((m) => { const n = { ...m }; delete n[i]; return n; }); }}
              className={cn(optBase, optIdle, "text-base md:text-xl", sel === i && "ring-4 ring-lacquer", map[i] !== undefined && colorOfLeft(i))}>{l}</button>
          ))}
        </div>
        <div className="space-y-3">
          {right.map((r) => {
            const l = leftOfRight(r);
            return (
              <button key={r} disabled={locked || sel === null || (usedRight.has(r) && l !== sel)} onClick={() => { if (sel === null) return; setMap((m) => ({ ...m, [sel]: r })); setSel(null); }}
                className={cn(optBase, optIdle, "text-base md:text-xl", l >= 0 && colorOfLeft(l), reveal && "opacity-90")}>
                {q.pairs[r][1]}
                {reveal && <span className="ml-auto text-sm">↔ {q.pairs[r][0]}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {!locked && <p className="mt-3 text-base opacity-70">Chạm một ô bên trái, rồi chạm ô tương ứng bên phải.</p>}
      {!locked && <div className="mt-4 text-center"><GButton variant="lacquer" disabled={!complete} onClick={() => onDone(q.pairs.map((_, i) => map[i]))}>Kiểm tra</GButton></div>}
    </div>
  );
}

function Order({ q, locked, reveal, onDone }: { q: Extract<Question, { type: "order" }>; locked: boolean; reveal: boolean; onDone: (r: string[]) => void }) {
  const [pool] = useState(() => {
    let s = shuffle(q.tokens.map((t, i) => ({ t, i })));
    if (s.every((x, k) => x.i === k)) s = [...s.slice(1), s[0]];
    return s;
  });
  const [placed, setPlaced] = useState<number[]>([]); // indices into pool
  return (
    <div>
      <div className="flex min-h-20 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 p-3">
        {placed.length === 0 && <span className="opacity-50">Chạm các tiếng bên dưới theo đúng thứ tự…</span>}
        {placed.map((p, k) => (
          <button key={k} disabled={locked} onClick={() => setPlaced((x) => x.filter((_, j) => j !== k))} className="animate-pop rounded-xl bg-gold-grad px-4 py-2 text-xl font-bold text-primary-foreground md:text-2xl">{pool[p].t}</button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pool.map((x, p) => (
          <button key={p} disabled={locked || placed.includes(p)} onClick={() => setPlaced((s) => [...s, p])} className={cn("rounded-xl border-2 border-ink/20 bg-paper px-4 py-2 text-xl font-semibold md:text-2xl", placed.includes(p) && "opacity-20")}>{x.t}</button>
        ))}
      </div>
      {reveal && <p className="mt-3 text-xl font-bold">Đáp án: {q.tokens.join(" ")}</p>}
      {!locked && <div className="mt-4 flex justify-center gap-3"><GButton variant="ghost" className="text-paper-foreground" onClick={() => setPlaced([])}>Làm lại</GButton><GButton variant="lacquer" disabled={placed.length !== pool.length} onClick={() => onDone(placed.map((p) => pool[p].t))}>Kiểm tra</GButton></div>}
    </div>
  );
}

function Classify({ q, locked, reveal, onDone }: { q: Extract<Question, { type: "classify" }>; locked: boolean; reveal: boolean; onDone: (r: (0 | 1)[]) => void }) {
  const [order] = useState(() => shuffle(q.items.map((_, i) => i)));
  const [bins, setBins] = useState<Record<number, 0 | 1>>({});
  const complete = Object.keys(bins).length === q.items.length;
  return (
    <div>
      <div className="space-y-2">
        {order.map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl border-2 border-ink/15 bg-paper p-2 md:flex-row md:items-center">
            <span className="flex-1 text-lg font-semibold md:text-xl">{q.items[i].text}{reveal && <b className="ml-2 text-success">→ {q.bins[q.items[i].bin]}</b>}</span>
            <div className="flex gap-2">
              {q.bins.map((b, k) => (
                <button key={k} disabled={locked} onClick={() => setBins((m) => ({ ...m, [i]: k as 0 | 1 }))}
                  className={cn("rounded-xl border-2 px-3 py-1.5 font-bold", bins[i] === k ? (k === 0 ? "border-lacquer bg-lacquer-grad text-accent-foreground" : "border-jade bg-jade-grad text-secondary-foreground") : "border-ink/20")}>{b}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!locked && <div className="mt-4 text-center"><GButton variant="lacquer" disabled={!complete} onClick={() => onDone(q.items.map((_, i) => bins[i]))}>Kiểm tra</GButton></div>}
    </div>
  );
}
