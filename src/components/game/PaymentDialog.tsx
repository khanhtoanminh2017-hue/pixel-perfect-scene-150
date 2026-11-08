import { useEffect, useState } from "react";
import { paymentQrDataUri } from "@/game/payment-qr";

/**
 * Chuyển khoản được xác minh thủ công qua Zalo.
 * Không tự xác nhận giao dịch hoặc mở khóa sản phẩm.
 */
export function PaymentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (!open) setCopyMessage("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const copyAccount = async () => {
    const number = "100886445449";
    try {
      await navigator.clipboard.writeText(number);
      setCopyMessage("Đã sao chép số tài khoản.");
    } catch {
      setCopyMessage("Không thể tự động sao chép. Vui lòng chọn và sao chép số 100886445449.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 md:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label="Mở khóa trò chơi vĩnh viễn" className="relative my-auto max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-amber-400 bg-[#fff8e9] p-5 text-center text-stone-900 shadow-2xl md:p-8">
        <button type="button" aria-label="Đóng thanh toán" onClick={onClose} className="absolute right-3 top-2 rounded-lg px-3 py-1 text-3xl font-bold text-stone-700 hover:bg-stone-200">×</button>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Bản dùng thử · Thanh toán thủ công</p>
        <h2 className="mt-2 pr-5 text-2xl font-black leading-tight md:text-3xl">MỞ KHÓA TRÒ CHƠI VĨNH VIỄN</h2>
        <p className="mt-2 text-lg">Giá: <strong className="text-2xl text-red-700">10.000 đồng</strong></p>
        <img src={paymentQrDataUri} alt="Mã QR VietinBank do người bán cung cấp, số tài khoản 100886445449, giá 10.000 đồng" className="mx-auto mt-3 h-auto w-full max-w-[230px] border border-stone-200 bg-white" />
        <p className="mt-3 font-semibold">Quét mã QR VietinBank để chuyển khoản.</p>
        <div className="mt-3 rounded-xl bg-white p-3 text-left leading-7">
          <p><strong>Ngân hàng:</strong> VietinBank</p>
          <p><strong>Chủ tài khoản:</strong> NGUYEN DUC THANG</p>
          <p><strong>Số tài khoản:</strong> <span className="select-all font-extrabold">100886445449</span></p>
          <p><strong>Giá:</strong> 10.000 đồng/trò chơi</p>
        </div>
        <button type="button" className="mt-3 w-full rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900" onClick={copyAccount}>Sao chép số tài khoản</button>
        <p role="status" className="mt-1 min-h-5 text-sm text-emerald-900">{copyMessage}</p>
        <div className="mt-3 space-y-2 text-sm leading-6">
          <p>Sau khi thanh toán, vui lòng gửi <strong>ảnh xác nhận giao dịch</strong> qua Zalo <strong>0973034797</strong>.</p>
          <p>Sau khi kiểm tra thanh toán, người bán sẽ gửi <strong>bộ trò chơi đầy đủ</strong> để sử dụng không giới hạn.</p>
          <p className="font-semibold text-red-800">Thanh toán không được xác nhận tự động và trò chơi không tự mở khóa sau khi chuyển khoản.</p>
        </div>
        <button type="button" className="mt-4 w-full rounded-xl border-2 border-stone-300 bg-white px-5 py-3 font-semibold hover:bg-stone-100" onClick={onClose}>Đóng màn hình thanh toán</button>
      </section>
    </div>
  );
}
