import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import homeBg from "@/assets/home-bg.jpg";
import { Scene, TopBar, GButton, JourneyMap, TrainLane, Timer, StationTokens, FlyToken } from "@/components/game/ui";
import { QuestionScroll } from "@/components/game/QuestionScroll";
import { StationIntro } from "@/components/game/StationIntro";
import { useCountdown } from "@/components/game/hooks";
import { buildQueue, POINTS, rankFor } from "@/game/engine";
import { lesson } from "@/game/lessons/nguvan6-bai4";
import { useBank, useSettings } from "@/game/store";
import { sfx } from "@/game/audio";
import { cn } from "@/lib/utils";
import type { Question } from "@/game/types";

export const Route = createFileRoute("/ca-nhan")({
  head: () => ({
    meta: [
      { title: "Hành trình cá nhân – Hành trình về miền ký ức" },
      { name: "description", content: "Một mình lái tàu qua 5 trạm, thu thập 5 mảnh ký ức quê hương." },
      { property: "og:title", content: "Hành trình cá nhân – Hành trình về miền ký ức" },
      { property: "og:description", content: "Thu thập 5 mảnh ký ức, mở kho báu quê hương." },
    ],
  }),
  component: SoloPage,
});

interface Run { name: string; queue: Question[]; key: number }

function SoloPage() {
  const [name, setName] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const settings = useSettings();
  const bank = useBank();
  const start = (n = name) => setRun({ name: n.trim() || "Nhà thám hiểm", queue: buildQueue(bank, settings.stations, settings.perStation), key: Date.now() });

  if (!run) {
    return (
      <Scene bg={homeBg}>
        <TopBar />
        <main className="flex flex-1 items-center justify-center p-4">
          <form className="paper-scroll animate-unfurl w-full max-w-xl rounded-3xl p-8 text-center" onSubmit={(e) => { e.preventDefault(); start(); }}>
            <div className="text-6xl">🚂</div>
            <h1 className="font-display text-4xl font-black">Hành trình cá nhân</h1>
            <label className="mt-6 block text-left text-lg font-semibold">Tên của em
              <input autoFocus value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Minh Anh" className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-2xl" />
            </label>
            <GButton type="submit" size="lg" variant="lacquer" className="mt-6 w-full">Lên tàu ký ức!</GButton>
          </form>
        </main>
      </Scene>
    );
  }
  return <Journey key={run.key} run={run} timer={settings.timer} onReplay={() => start(run.name)} />;
}

function Journey({ run, timer, onReplay }: { run: Run; timer: number; onReplay: () => void }) {
  const { queue } = run;
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<{ q: Question; correct: boolean }[]>([]);
  const [answered, setAnswered] = useState(false);
  const [intro, setIntro] = useState<number | null>(queue[0]?.station ?? null);
  const [fragment, setFragment] = useState<number | null>(null);
  const [fly, setFly] = useState(0);
  const done = idx >= queue.length;
  const q = queue[Math.min(idx, queue.length - 1)];
  const stations = [...new Set(queue.map((x) => x.station))];
  const score = results.filter((r) => r.correct).length * POINTS;
  const answeredRef = useRef(false);

  const answer = (correct: boolean) => {
    if (answeredRef.current) return; // lock
    answeredRef.current = true;
    setAnswered(true);
    setResults((r) => [...r, { q, correct }]);
    if (correct) { sfx.correct(); setTimeout(sfx.train, 400); setFly((f) => f + 1); } else sfx.wrong();
  };
  const { left, max } = useCountdown(timer, !answered && intro === null && fragment === null && !done, String(idx), () => answer(false));

  const next = () => {
    const ni = idx + 1;
    answeredRef.current = false;
    setAnswered(false);
    if (ni >= queue.length || queue[ni].station !== q.station) { sfx.unlock(); setFragment(q.station); }
    setIdx(ni);
  };
  useEffect(() => { if (done && fragment === null) sfx.victory(); }, [done, fragment]);

  const finishedStations = stations.filter((st) => queue.filter((x) => x.station === st).every((x) => queue.indexOf(x) < idx));
  const stQs = queue.filter((x) => x.station === q.station);
  const lit = results.filter((r) => r.q.station === q.station && r.correct).length;
  const last = results[results.length - 1];

  if (fragment !== null) {
    return (
      <Scene bg={lesson.stations[fragment].bg}>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="paper-scroll animate-pop max-w-xl rounded-3xl p-8 text-center">
            <div className="animate-shimmer text-8xl">🧩</div>
            <h2 className="mt-2 font-display text-4xl font-black">Nhận được {lesson.stations[fragment].memory}!</h2>
            <p className="mt-2 text-xl">Đã thu thập {finishedStations.length}/{stations.length} mảnh ký ức · {score} điểm</p>
            <GButton size="lg" variant="lacquer" className="mt-6" onClick={() => { setFragment(null); if (!done) setIntro(queue[idx].station); }}>{done ? "Mở kho báu quê hương ✨" : "Đến trạm tiếp theo 🚂"}</GButton>
          </div>
        </main>
      </Scene>
    );
  }
  if (done) return <SoloResult name={run.name} results={results} onReplay={onReplay} />;

  return (
    <Scene bg={lesson.stations[q.station].bg}>
      {intro !== null && <StationIntro station={intro} number={stations.indexOf(intro) + 1} onStart={() => setIntro(null)} />}
      {fly > 0 && <FlyToken key={fly} token={lesson.stations[q.station].token} />}
      <TopBar>
        <span className="rounded-xl bg-card/80 px-3 py-2 font-bold">🧒 {run.name}</span>
        <span className="rounded-xl bg-gold-grad px-3 py-2 font-display text-xl font-black text-primary-foreground">{score} điểm</span>
        <span className="hidden rounded-xl bg-card/80 px-3 py-2 md:inline">🎒 {finishedStations.length}/{stations.length} mảnh</span>
      </TopBar>
      <div className="space-y-2 px-3">
        <TrainLane name="Đoàn tàu của em" pos={idx + (answered ? 1 : 0)} max={queue.length} active color="jade" />
        <JourneyMap stations={stations} current={q.station} done={finishedStations} />
      </div>
      <main className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card/80 px-4 py-2 backdrop-blur">
          <div>
            <div className="text-sm opacity-80">Câu {idx + 1}/{queue.length}</div>
            <div className="font-display text-2xl font-black text-gold">{lesson.stations[q.station].name}</div>
          </div>
          <StationTokens token={lesson.stations[q.station].token} lit={lit} total={stQs.length} />
          <Timer left={left} total={max} />
        </div>
        <QuestionScroll key={q.id + idx} q={q} locked={answered || intro !== null} reveal={answered} lastCorrect={answered ? last?.correct : null} onSubmit={answer} />
        {answered && <div className="text-center"><GButton size="lg" variant="lacquer" onClick={next}>Tiếp tục →</GButton></div>}
      </main>
    </Scene>
  );
}

function SoloResult({ name, results, onReplay }: { name: string; results: { q: Question; correct: boolean }[]; onReplay: () => void }) {
  const right = results.filter((r) => r.correct);
  const wrong = results.filter((r) => !r.correct);
  const score = right.length * POINTS;
  const max = results.length * POINTS;
  const rank = rankFor(score, max);
  const allFragments = new Set(results.map((r) => r.q.station)).size;
  return (
    <Scene bg={lesson.stations[4].bg}>
      <TopBar />
      <main className="flex flex-1 items-start justify-center p-4">
        <div className="paper-scroll animate-pop w-full max-w-4xl rounded-3xl p-6 md:p-10">
          <div className="text-center">
            <div className="text-7xl">{allFragments >= 5 ? "💎" : "🎁"}</div>
            <p className="text-lg font-semibold uppercase tracking-widest opacity-70">Kho báu quê hương đã mở</p>
            <h1 className="font-display text-4xl font-black md:text-5xl">{rank.title}</h1>
            <p className="mt-1 text-xl">{name} · {score}/{max} điểm</p>
            <p className="mt-1 italic">{rank.note}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl border-4 border-success p-4"><div className="font-display text-5xl font-black">{right.length}</div>câu đúng</div>
            <div className="rounded-2xl border-4 border-lacquer p-4"><div className="font-display text-5xl font-black">{wrong.length}</div>câu cần ôn</div>
          </div>
          {wrong.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-2xl font-bold">📚 Kiến thức cần ôn tập</h2>
              <ul className="mt-2 space-y-2">
                {wrong.map(({ q }) => (
                  <li key={q.id} className="rounded-xl border-2 border-ink/15 p-3">
                    <div className="text-sm font-bold opacity-70">{lesson.stations[q.station].name}</div>
                    <div className="font-semibold">{q.prompt}</div>
                    <div className={cn("mt-1")}>💡 {q.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 text-center"><GButton size="lg" variant="lacquer" onClick={onReplay}>Chơi lại (đảo câu hỏi) 🔄</GButton></div>
        </div>
      </main>
    </Scene>
  );
}
