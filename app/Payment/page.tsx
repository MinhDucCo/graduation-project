import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ThanhToanOnline() {
  const router = useRouter();
  const { don_hang_id, tong_tien } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!don_hang_id || !tong_tien) return;

    async function taoThanhToan() {
      try {
        const res = await fetch("/api/vnpay/create_payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ don_hang_id, tong_tien: Number(tong_tien) }),
        });
        const data = await res.json();
        window.location.href = data.paymentUrl;
      } catch (err) {
        alert("Lỗi tạo thanh toán. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    taoThanhToan();
  }, [don_hang_id, tong_tien]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">Đang chuyển đến cổng thanh toán...</p>
      </div>
    </div>
  );
}