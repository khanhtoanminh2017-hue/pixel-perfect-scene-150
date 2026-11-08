import { lesson } from "@/game/lessons/nguvan6-bai4";
import { GButton } from "./ui";

export function StationIntro({ station, number, onStart }: { station: number; number: number; onStart: () => void }) {
  const st = lesson.stations[station];
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-veil p-4 backdrop-blur-sm">
      <div className="paper-scroll animate-unfurl max-w-2xl rounded-3xl p-8 text-center">
        <div className="text-7xl animate-sway">{st.token}</div>
        <p className="mt-3 text-lg font-semibold uppercase tracking-widest opacity-70">Mở khóa trạm {number}</p>
        <h2 className="font-display text-4xl font-black md:text-5xl">{st.name}</h2>
        <p className="mt-2 text-xl">{st.topic}</p>
        <p className="mt-4 text-lg italic">{st.mechanic}</p>
        <GButton size="lg" variant="lacquer" className="mt-6" onClick={onStart}>Lên tàu! 🚂</GButton>
      </div>
    </div>
  );
}
