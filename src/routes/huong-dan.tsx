import { createFileRoute, Link } from "@tanstack/react-router";
import homeBg from "@/assets/home-bg.jpg";
import { Scene, TopBar, gameButton } from "@/components/game/ui";
import { lesson } from "@/game/lessons/nguvan6-bai4";

export const Route = createFileRoute("/huong-dan")({
  head: () => ({
    meta: [
      { title: "Hướng dẫn chơi – Hành trình về miền ký ức" },
      { name: "description", content: "Luật chơi chế độ hai đội và hành trình cá nhân." },
      { property: "og:title", content: "Hướng dẫn chơi – Hành trình về miền ký ức" },
      { property: "og:description", content: "Luật chơi chế độ hai đội và hành trình cá nhân." },
    ],
  }),
  component: Guide,
});

function Guide() {
  return (
    <Scene bg={homeBg}>
      <TopBar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-10">
        <div className="paper-scroll animate-unfurl rounded-3xl p-6 text-lg md:p-10 md:text-xl">
          <h1 className="font-display text-4xl font-black">Hướng dẫn chơi</h1>
          <h2 className="mt-6 font-display text-2xl font-bold">🚂 Hành trình 5 trạm</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            {lesson.stations.map((s) => <li key={s.name}><b>{s.token} {s.name}</b> – {s.topic}</li>)}
          </ol>
          <h2 className="mt-6 font-display text-2xl font-bold">👥 Hai đội thi đấu</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Hai đội lần lượt trả lời. Đúng: +10 điểm, tàu tiến một chặng.</li>
            <li>Sai hoặc hết giờ: không có điểm, hiện đáp án và giải thích, chuyển lượt.</li>
            <li>Mỗi đội có 2 quyền trợ giúp, dùng 1 lần cả trận: <b>Loại 2 phương án sai</b> và <b>Thêm 15 giây</b>.</li>
            <li>Hòa điểm: câu hỏi phụ – mỗi đội 1 câu/lượt, đội đúng khi đội kia sai sẽ thắng. Hết câu phụ: đồng chiến thắng.</li>
            <li>Giáo viên có thể tạm dừng, chuyển câu và chơi lại trận.</li>
          </ul>
          <h2 className="mt-6 font-display text-2xl font-bold">🧒 Hành trình cá nhân</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Nhập tên, đi qua 5 trạm × 4 câu = 20 câu. Mỗi câu đúng +10 điểm.</li>
            <li>Hoàn thành mỗi trạm nhận một mảnh ký ức. Đủ 5 mảnh mở kho báu quê hương.</li>
            <li>Xếp loại: 180–200 Nhà khám phá xuất sắc · 140–170 Người gìn giữ ký ức · 100–130 Người khám phá triển vọng · dưới 100 Hãy tiếp tục hành trình.</li>
          </ul>
          <h2 className="mt-6 font-display text-2xl font-bold">🧩 Các dạng thử thách</h2>
          <p className="mt-2">Trắc nghiệm, chọn hình ảnh, ghép cặp, sắp xếp tiếng thành câu lục bát, phân loại từ đồng âm – đa nghĩa, nhận diện biện pháp tu từ.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/doi" className={gameButton({ variant: "gold" })}>Chơi hai đội</Link>
            <Link to="/ca-nhan" className={gameButton({ variant: "jade" })}>Chơi cá nhân</Link>
          </div>
        </div>
      </main>
    </Scene>
  );
}
