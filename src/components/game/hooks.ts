import { useEffect, useRef, useState } from "react";
import { sfx } from "@/game/audio";

/** Countdown that resets on `resetKey`, runs only while `running`, calls onExpire once at 0. */
export function useCountdown(total: number, running: boolean, resetKey: string, onExpire: () => void) {
  const [left, setLeft] = useState(total);
  const [max, setMax] = useState(total);
  const expire = useRef(onExpire);
  expire.current = onExpire;
  useEffect(() => { setLeft(total); setMax(total); }, [resetKey, total]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { clearInterval(id); setTimeout(() => expire.current(), 0); return 0; }
        if (l <= 6) sfx.tick();
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, resetKey]);
  const add = (s: number) => { setLeft((l) => l + s); setMax((m) => m + s); };
  return { left, max, add };
}
