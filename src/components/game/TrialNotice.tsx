import { FREE_PLAYS, isFullVersion, playsLeft } from "@/game/trial";

export function TrialNotice({ compact = false }: { compact?: boolean }) {
  const left = playsLeft();
  return (
    <div className={`rounded-2xl border border-amber-400/70 bg-amber-50/95 px-5 py-4 text-center text-stone-900 shadow-xl ${compact ? "text-sm" : "text-base"}`}>
      <p className="text-lg font-extrabold">{isFullVersion() ? "PHIÊN BẢN ĐẦY ĐỦ – KHÔNG GIỚI HẠN" : "PHIÊN BẢN DÙNG THỬ MIỄN PHÍ"}</p>
      {!isFullVersion() && (
        <>
          <p className="mt-1 font-semibold">Còn {left}/{FREE_PLAYS} lượt chơi miễn phí trên trình duyệt này</p>
          <p className="mt-1">Mỗi lần bắt đầu trận hoặc chơi lại tính một lượt. Không cần đăng nhập.</p>
          <p className="mt-2 font-bold">Bản đầy đủ dự kiến: 10.000đ – thanh toán một lần, không giới hạn lượt.</p>
          <p className="mt-1 text-xs">Liên hệ người thiết kế để biết cách mua. Chưa tích hợp thanh toán.</p>
        </>
      )}
    </div>
  );
}

export function TrialExhausted() {
  return (
    <div role="alert" className="mt-4 rounded-xl border-2 border-red-600 bg-white p-4 text-center font-semibold text-red-800">
      Đã sử dụng hết 2 lượt miễn phí trên trình duyệt này. Bản đầy đủ dự kiến 10.000đ – liên hệ người thiết kế để biết thêm.
    </div>
  );
}
