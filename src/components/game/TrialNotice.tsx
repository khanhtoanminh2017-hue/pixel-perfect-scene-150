import { useEffect, useState } from "react";
import { FREE_PLAYS, isFullVersion, playsLeft } from "@/game/trial";
import { PaymentDialog } from "@/components/game/PaymentDialog";

export function TrialNotice({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const left = playsLeft();
  return (
    <>
      <div className={`rounded-2xl border border-amber-400/70 bg-amber-50/95 px-5 py-4 text-center text-stone-900 shadow-xl ${compact ? "text-sm" : "text-base"}`}>
        <p className="text-lg font-extrabold">{isFullVersion() ? "PHIÊN BẢN ĐẦY ĐỦ – KHÔNG GIỚI HẠN" : "PHIÊN BẢN DÙNG THỬ MIỄN PHÍ"}</p>
        {!isFullVersion() && (
          <>
            <p className="mt-1 font-semibold">Còn {left}/{FREE_PLAYS} lượt chơi miễn phí trên trình duyệt này</p>
            <p className="mt-1">Mỗi lần bắt đầu trận hoặc chơi lại tính một lượt. Không cần đăng nhập.</p>
            <p className="mt-2 font-bold">Bản đầy đủ: 10.000đ/trò chơi – chuyển khoản và nhận bộ trò chơi không giới hạn sau khi người bán xác nhận.</p>
            <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl bg-red-700 px-4 py-3 text-base font-extrabold text-white shadow-md hover:bg-red-800">
              MUA BẢN VĨNH VIỄN
            </button>
          </>
        )}
      </div>
      <PaymentDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function TrialExhausted() {
  const [open, setOpen] = useState(true);
  useEffect(() => { setOpen(true); }, []);
  return (
    <>
      <div role="alert" className="mt-4 rounded-xl border-2 border-red-600 bg-white p-4 text-center font-semibold text-red-800">
        <p>Đã sử dụng hết 2 lượt miễn phí trên trình duyệt này.</p>
        <button type="button" className="mt-3 rounded-xl bg-red-700 px-5 py-3 font-extrabold text-white hover:bg-red-800" onClick={() => setOpen(true)}>MUA BẢN VĨNH VIỄN – 10.000đ</button>
      </div>
      <PaymentDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
