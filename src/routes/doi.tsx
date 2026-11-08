import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";
import { Pause, Play, SkipForward, RotateCcw, Scissors, Clock } from "lucide-react";
import homeBg from "@/assets/home-bg.jpg";
import { Scene, TopBar, GButton, JourneyMap, TrainLane, Timer, StationTokens, FlyToken } from "@/components/game/ui";
import { QuestionScroll } from "@/components/game/QuestionScroll";
import { StationIntro } from "@/components/game/StationIntro";
import { useCountdown } from "@/components/game/hooks";
import { buildQueue, currentQuestion, fiftyFifty, initTeam, shuffle, teamReducer, type TeamState } from "@/game/engine";
import { lesson } from "@/game/lessons/nguvan6-bai4";
import { saveSettings, useBank, useSettings } from "@/game/store";
import { sfx } from "@/game/audio";
import { cn } from "@/lib/utils";
import type { Question } from "@/game/types";

export const Route = createFileRoute("/doi")({
  head: () => ({
    meta: [
      { title: "Hai đội thi đấu – Hành trình về miền ký ức" },
      { name: "description", content: "Đội Tre Xanh và Đội Lúa Vàng đua tàu qua 5 trạm tri thức." },
      { property: "og:title", content: "Hai đội thi đấu – Hành trình về miền ký ức" },
      { property: "og:description", content: "Đua tàu qua 5 trạm tri thức Ngữ văn 6." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const settings = useSettings();
  const bank = useBank();
  const [names, setNames] = useState<[string, string]>(settings.teamNames);
  const [timer, setTimer] = useState(settings.timer);
  const [game, setGame] = useState<{ queue: Question[]; tie: Question[]; key: number } | null>(null);
  useEffect(() => { setNames(settings.teamNames); setTimer(settings.timer); }, [settings.teamNames, settings.timer]);

  const start = () => {
    const n: [string, string] = [names[0].trim() || "Đội Tre Xanh", names[1].trim() || "Đội Lúa Vàng"];
    saveSettings({ teamNames: n, timer });
    // even count so both teams get the same number of turns
    const per = settings.perStation % 2 === 0 ? settings.perStation : settings.perStation + 1;
    const queue = buildQueue(bank, settings.stations, per);
    const used = new Set(queue.map((q) => q.id));
    const tie = shuffle(bank.filter((q) => !used.has(q.id) && q.type === "mcq")).slice(0, 6);
    setGame({ queue, tie, key: Date.now() });
  };

  if (!game) {
    return (
      <Scene bg={homeBg}>
        <TopBar />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="paper-scroll animate-unfurl w-full max-w-2xl rounded-3xl p-8">
            <h1 className="font-display text-4xl font-black">Hai đội thi đấu</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[0, 1].map((i) => (
                <label key={i} className="block text-lg font-semibold">{i === 0 ? "🎋 Đội 1" : "🌾 Đội 2"}
                  <input value={names[i]} maxLength={24} onChange={(e) => setNames((n) => (i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value]))} className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-xl" />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-lg font-semibold">Thời gian mỗi câu: {timer} giây
              <input type="range" min={10} max={90} step={5} value={timer} onChange={(e) => setTimer(+e.target.value)} className="mt-2 w-full accent-lacquer" />
            </label>
            <p className="mt-2 opacity-70">Trạm: {settings.stations.length} · {settings.perStation % 2 === 0 ? settings.perStation : settings.perStation + 1} câu/trạm (đổi trong Bảng giáo viên)</p>
            <GButton size="lg" variant="lacquer" className="mt-6 w-full" onClick={start}>Bắt đầu trận đấu 🚂</GButton>
          </div>
        </main>
      </Scene>
    );
  }
  return <Match key={game.key} names={names} timer={timer} queue={game.queue} tie={game.tie} onRestart={start} onSetup={() => setGame(null)} />;
}

function Match({ names, timer, queue, tie, onRestart, onSetup }: { names: [string, string]; timer: number; queue: Question[]; tie: Question[]; onRestart: () => void; onSetup: () => void }) {
  const [s, dispatch] = useReducer(teamReducer, undefined, () => initTeam(names, queue, tie));
  const [paused, setPaused] = useState(false);
  const [intro, setIntro] = useState<number | null>(queue[0]?.station ?? null);
  const [fly, setFly] = useState(0);
  const q = currentQuestion(s);
  const inTie = s.index >= s.queue.length;
  const station = q?.station ?? 0;
  const stations = [...new Set(queue.map((x) => x.station))];
  const running = !paused && intro === null && (s.phase === "play" || s.phase === "tiebreak");
  const qKey = `${s.index}-${s.tieIndex}-${s.phase === "tiebreak" ? "t" : "m"}`;
  const { left, max, add } = useCountdown(timer, running, qKey, () => dispatch({ type: "answer", correct: false }));

  // sounds + effects when an answer resolves
  const prevAnswered = useRef(false);
  useEffect(() => {
    if (s.answered && !prevAnswered.current) {
      if (s.lastCorrect) { sfx.correct(); setTimeout(sfx.train, 400); setFly((f) => f + 1); } else sfx.wrong();
    }
    prevAnswered.current = s.answered;
  }, [s.answered, s.lastCorrect]);

  // station change → unlock intro
  const prevStation = useRef(station);
  useEffect(() => {
    if (!inTie && station !== prevStation.current && s.phase === "play") { sfx.unlock(); setIntro(station); }
    prevStation.current = station;
  }, [station, inTie, s.phase]);
  useEffect(() => { if (s.phase === "done") sfx.victory(); }, [s.phase]);

  const doneStations = stations.filter((st) => inTie || (queue.findIndex((x) => x.station === st) !== -1 && queue.filter((x) => x.station === st).every((x) => queue.indexOf(x) < s.index)));
  const stQs = queue.filter((x) => x.station === station);
  const stLit = inTie ? 0 : stQs.filter((x) => queue.indexOf(x) < s.index || (queue.indexOf(x) === s.index && s.answered && s.lastCorrect)).length;
  const maxPos = Math.ceil(queue.length / 2);

  if (s.phase === "done") return <TeamResult s={s} onRestart={onRestart} onSetup={onSetup} />;

  const team = s.teams[s.turn];
  return (
    <Scene bg={lesson.stations[station].bg}>
      {intro !== null && <StationIntro station={intro} number={stations.indexOf(intro) + 1} onStart={() => setIntro(null)} />}
      {fly > 0 && <FlyToken key={fly} token={lesson.stations[station].token} />}
      <TopBar>
        <GButton variant="ghost" size="sm" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Tiếp tục" : "Tạm dừng"}>{paused ? <Play className="size-5" /> : <Pause className="size-5" />}<span className="hidden md:inline">{paused ? "Tiếp tục" : "Tạm dừng"}</span></GButton>
        <GButton variant="ghost" size="sm" onClick={() => dispatch({ type: "skip" })}><SkipForward className="size-5" /><span className="hidden md:inline">Chuyển câu</span></GButton>
        <GButton variant="ghost" size="sm" onClick={() => { if (confirm("Khởi động lại trận đấu?")) onRestart(); }}><RotateCcw className="size-5" /><span className="hidden md:inline">Chơi lại</span></GButton>
      </TopBar>
      <div className="grid gap-2 px-3 md:grid-cols-2">
        {s.teams.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1"><TrainLane name={t.name} pos={t.pos} max={maxPos} active={s.turn === i} color={i === 0 ? "jade" : "gold"} /></div>
            <div className={cn("grid min-w-20 place-items-center rounded-xl border-2 px-3 py-2 font-display text-3xl font-black", i === 0 ? "border-jade bg-jade-grad" : "border-gold bg-gold-grad text-primary-foreground")}>{t.score}</div>
          </div>
        ))}
      </div>
      <div className="px-3 pt-2"><JourneyMap stations={stations} current={inTie ? -1 : station} done={doneStations} /></div>
      <main className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card/80 px-4 py-2 backdrop-blur">
          <div>
            <div className="text-sm opacity-80">{inTie ? "⚡ CÂU HỎI PHỤ" : `${lesson.stations[station].name} · Câu ${s.index + 1}/${queue.length} · còn ${queue.length - s.index - (s.answered ? 1 : 0)} câu`}</div>
            <div className="font-display text-2xl font-black text-gold md:text-3xl">Lượt: {team.name}</div>
          </div>
          {!inTie && <StationTokens token={lesson.stations[station].token} lit={stLit} total={stQs.length} />}
          <div className="flex items-center gap-2">
            <GButton variant="ghost" size="sm" disabled={!team.fifty || s.answered || q?.type !== "mcq" || paused} onClick={() => q && dispatch({ type: "fifty", remove: fiftyFifty(q) })}><Scissors className="size-5" />50/50</GButton>
            <GButton variant="ghost" size="sm" disabled={!team.time || s.answered || paused} onClick={() => { dispatch({ type: "time" }); add(15); }}><Clock className="size-5" />+15s</GButton>
            <Timer left={left} total={max} />
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-gold transition-all" style={{ width: `${((s.index + (s.answered ? 1 : 0)) / queue.length) * 100}%` }} /></div>
        {paused ? (
          <div className="paper-scroll mx-auto mt-10 rounded-3xl p-10 text-center"><p className="font-display text-4xl font-black">⏸ Tạm dừng</p><GButton className="mt-4" onClick={() => setPaused(false)}>Tiếp tục</GButton></div>
        ) : q && (
          <>
            <QuestionScroll key={qKey} q={q} locked={s.answered || intro !== null} reveal={s.answered} lastCorrect={s.lastCorrect} eliminated={s.eliminated} onSubmit={(c) => dispatch({ type: "answer", correct: c })} />
            {s.answered && <div className="text-center"><GButton size="lg" variant="lacquer" onClick={() => dispatch({ type: "next" })}>Câu tiếp theo →</GButton></div>}
          </>
        )}
      </main>
    </Scene>
  );
}

function TeamResult({ s, onRestart, onSetup }: { s: TeamState; onRestart: () => void; onSetup: () => void }) {
  const w = s.winner;
  return (
    <Scene bg={lesson.stations[4].bg}>
      <TopBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="paper-scroll animate-pop w-full max-w-3xl rounded-3xl p-8 text-center">
          <div className="text-7xl">🏆</div>
          <h1 className="font-display text-4xl font-black md:text-6xl">{w === "draw" ? "Đồng chiến thắng!" : `${s.teams[w as 0 | 1].name} chiến thắng!`}</h1>
          <p className="mt-2 text-xl">Ngọn hải đăng tri thức đã sáng rực – quê hương hiện ra trong ký ức.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {s.teams.map((t, i) => (
              <div key={i} className={cn("rounded-2xl border-4 p-4", w === i || w === "draw" ? "border-gold shadow-glow" : "border-ink/20")}>
                <div className="text-xl font-bold">{t.name}</div>
                <div className="font-display text-5xl font-black">{t.score}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <GButton size="lg" variant="lacquer" onClick={onRestart}>Chơi lại trận mới</GButton>
            <GButton size="lg" variant="jade" onClick={onSetup}>Đổi tên đội</GButton>
          </div>
        </div>
      </main>
    </Scene>
  );
}
