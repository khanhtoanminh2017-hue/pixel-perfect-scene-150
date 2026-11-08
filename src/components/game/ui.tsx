import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import { Maximize, Minimize, Volume2, VolumeX, Home } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isMuted, onMute, setMuted, sfx, startBgm } from "@/game/audio";
import { lesson } from "@/game/lessons/nguvan6-bai4";
import { PaymentDialog } from "@/components/game/PaymentDialog";

export const gameButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        gold: "bg-gold-grad text-primary-foreground border-2 border-gold shadow-lg hover:brightness-110",
        lacquer: "bg-lacquer-grad text-accent-foreground border-2 border-gold/60 shadow-lg hover:brightness-110",
        jade: "bg-jade-grad text-secondary-foreground border-2 border-gold/50 shadow-lg hover:brightness-110",
        ghost: "bg-card/70 text-foreground border border-border backdrop-blur hover:bg-card",
      },
      size: { sm: "px-3 py-2 text-sm", md: "px-5 py-3 text-lg", lg: "px-8 py-5 text-2xl" },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

export function GButton({ className, variant, size, onClick, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof gameButton>) {
  return <button className={cn(gameButton({ variant, size }), className)} onClick={(e) => { startBgm(); sfx.click(); onClick?.(e); }} {...p} />;
}

export function useMuted() {
  const [m, setM] = useState(false);
  useEffect(() => { setM(isMuted()); return onMute(setM); }, []);
  return m;
}

export function TopBar({ children }: { children?: ReactNode }) {
  const muted = useMuted();
  const [fs, setFs] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  useEffect(() => {
    const f = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);
  return (
    <div className="flex items-center justify-between gap-2 p-3">
      <div className="flex items-center gap-2">
        <Link to="/" className={gameButton({ variant: "ghost", size: "sm" })} aria-label="Về màn hình chính"><Home className="size-5" /></Link>
        {children}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-semibold text-amber-100 sm:inline">BẢN DÙNG THỬ</span>
        <button type="button" onClick={() => setPaymentOpen(true)} className="rounded-lg border border-amber-300/60 bg-black/40 px-2 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-900/80 sm:px-3" aria-label="Mua bản quyền trò chơi giá 10.000 đồng">Mua bản quyền · 10.000đ</button>
        <button className={gameButton({ variant: "ghost", size: "sm" })} aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"} onClick={() => { startBgm(); setMuted(!muted); }}>
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
        <button className={gameButton({ variant: "ghost", size: "sm" })} aria-label="Toàn màn hình" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}>
          {fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
        </button>
      </div>
      <PaymentDialog open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}

export function Scene({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 size-full object-cover" width={1920} height={1088} />
      <div className="absolute inset-0 bg-veil" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-drift absolute top-[8%] text-6xl opacity-60" style={{ animationDuration: "70s" }}>☁️</div>
        <div className="animate-drift absolute top-[18%] text-4xl opacity-40" style={{ animationDuration: "95s", animationDelay: "-40s" }}>☁️</div>
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
        <footer className="mt-auto px-3 pb-3 pt-3 text-center text-xs font-semibold text-amber-100/95 drop-shadow-[0_1px_3px_#000] md:text-sm">{lesson.credit}</footer>
      </div>
    </div>
  );
}

/** Horizontal journey map: stations with unlock state and a moving train. */
export function JourneyMap({ stations, current, done }: { stations: number[]; current: number; done: number[] }) {
  return (
    <div className="flex items-center justify-between gap-1 rounded-2xl bg-card/80 px-3 py-2 backdrop-blur">
      {stations.map((s, i) => {
        const st = lesson.stations[s];
        const isDone = done.includes(s);
        const isCur = s === current;
        return (
          <div key={s} className="flex flex-1 items-center">
            <div className={cn("flex flex-col items-center text-center", !isDone && !isCur && "opacity-45")}>
              <div className={cn("grid size-10 place-items-center rounded-full border-2 text-xl md:size-12", isDone ? "border-gold bg-gold-grad" : isCur ? "border-gold bg-lacquer-grad animate-glow" : "border-border bg-muted")}>
                {isDone ? "✓" : isCur ? "🚂" : "🔒"}
              </div>
              <span className="mt-1 hidden text-xs font-semibold md:block">{st.name}</span>
            </div>
            {i < stations.length - 1 && <div className={cn("mx-1 h-1 flex-1 rounded", isDone ? "bg-gold" : "bg-muted")} />}
          </div>
        );
      })}
    </div>
  );
}

export function StationTokens({ token, lit, total }: { token: string; lit: number; total: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cn("text-3xl transition-all duration-500 md:text-4xl", i < lit ? "animate-sway drop-shadow-[0_0_12px_var(--gold)]" : "opacity-30 grayscale")}>{token}</span>
      ))}
    </div>
  );
}

export function TrainLane({ name, pos, max, active, color }: { name: string; pos: number; max: number; active: boolean; color: "jade" | "gold" }) {
  const pct = max > 0 ? Math.min(pos / max, 1) * 100 : 0;
  return (
    <div className={cn("relative rounded-xl border-2 bg-card/80 px-3 pb-2 pt-1 backdrop-blur", active ? "border-gold" : "border-transparent")}>
      <div className="text-sm font-bold">{name}</div>
      <div className="relative mt-1 h-10">
        <div className="absolute inset-x-0 bottom-1 h-1 rounded bg-muted" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--muted-foreground) 0 3px, transparent 3px 14px)" }} />
        <div className="absolute bottom-1 text-3xl transition-all duration-1000 ease-out" style={{ left: `calc(${pct}% - ${pct / 100} * 2.5rem)` }}>
          <span className={cn("inline-block", active && "animate-chug")}>{color === "jade" ? "🚂" : "🚃"}</span>
        </div>
        <div className="absolute right-0 top-0 text-xl">🏁</div>
      </div>
    </div>
  );
}

export function Timer({ left, total }: { left: number; total: number }) {
  const pct = Math.max(0, left / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className={cn("grid size-16 place-items-center rounded-full border-4 font-display text-2xl font-black", left <= 5 ? "border-destructive text-destructive" : "border-gold text-gold")}>{left}</div>
      <div className="hidden h-3 w-32 overflow-hidden rounded bg-muted md:block"><div className="h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function FlyToken({ token }: { token: string }) {
  return <span className="animate-fly pointer-events-none fixed left-1/2 top-1/2 z-50 text-6xl">{token}</span>;
}
