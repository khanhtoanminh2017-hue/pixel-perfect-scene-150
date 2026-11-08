import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, User, BookOpen, Settings } from "lucide-react";
import homeBg from "@/assets/home-bg.jpg";
import { Scene, TopBar, gameButton } from "@/components/game/ui";
import { lesson } from "@/game/lessons/nguvan6-bai4";
import { startBgm } from "@/game/audio";
import { TrialNotice } from "@/components/game/TrialNotice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hành trình về miền ký ức – Ngữ văn 6 Bài 4" },
      { name: "description", content: "Lên đoàn tàu ký ức qua 5 trạm: ca dao, lục bát, cây tre, chuyện cổ và tiếng Việt." },
      { property: "og:title", content: "Hành trình về miền ký ức" },
      { property: "og:description", content: "Trò chơi ôn tập Ngữ văn 6 – Bài 4: Quê hương yêu dấu." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Scene bg={homeBg}>
      <TopBar>
        <Link to="/huong-dan" className={gameButton({ variant: "ghost", size: "sm" })}><Settings className="size-5" /> Hướng dẫn</Link>
      </TopBar>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10 text-center">
        <p className="rounded-full border border-amber-300/70 bg-black/60 px-5 py-2 text-base font-bold tracking-wider text-amber-100 md:text-xl">THƯ VIỆN TRÒ CHƠI GIÁO DỤC</p>
        <p className="mt-3 text-lg font-semibold tracking-[0.3em] text-gold md:text-xl">🚂 ĐOÀN TÀU KÝ ỨC 🚂</p>
        <h1 className="text-glow mt-3 font-display text-5xl font-black leading-tight text-foreground md:text-8xl">{lesson.title}</h1>
        <p className="mt-4 rounded-full bg-lacquer-grad px-6 py-2 text-lg font-bold text-accent-foreground md:text-2xl">{lesson.subtitle}</p>
        <div className="mt-5 w-full max-w-3xl"><TrialNotice /></div>
        <div className="mt-6 grid w-full max-w-4xl gap-4 md:grid-cols-3" onClick={() => startBgm()}>
          <Link to="/doi" className={gameButton({ variant: "gold", size: "lg" })}><Users className="size-7" /> HAI ĐỘI THI ĐẤU</Link>
          <Link to="/ca-nhan" className={gameButton({ variant: "jade", size: "lg" })}><User className="size-7" /> HÀNH TRÌNH CÁ NHÂN</Link>
          <Link to="/huong-dan" className={gameButton({ variant: "lacquer", size: "lg" })}><BookOpen className="size-7" /> HƯỚNG DẪN CHƠI</Link>
        </div>
      </main>
      <footer className="pb-4 text-center text-base font-semibold text-foreground/90">{lesson.credit}</footer>
    </Scene>
  );
}
