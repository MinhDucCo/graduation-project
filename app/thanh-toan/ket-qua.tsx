import { useRouter } from "next/router";
import { useEffect } from "react";

export default function KetQuaThanhToan() {
  const router = useRouter();
  const { vnp_ResponseCode, don_hang_id } = router.query;

  useEffect(() => {
    if (!vnp_ResponseCode || !don_hang_id) return;

    if (vnp_ResponseCode === "00") {
      // CẬP NHẬT STATUS = "Đã thanh toán"
      fetch("http://localhost:3000/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: don_hang_id, status: "Đã thanh toán" }),
      });
      alert(`Thanh toán THÀNH CÔNG! Mã đơn: ${don_hang_id}`);
      window.location.href = "/don-hang-cua-moi";
    } else {
      alert("Thanh toán thất bại. Vui lòng thử lại.");
    }
  }, [vnp_ResponseCode, don_hang_id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4">Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  );
}