"use client";
import { useEffect, useState } from "react";


export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    // ho_ten: "",
    ten_nguoi_nhan: "",
    dia_chi: "",
    dien_thoai: "",
    ghi_chu: "",
  });
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState<"online" | "cod">("cod"); // Mặc định COD
  const [idUser, setIdUser] = useState<string | null>(null);
  // 🔹 Lấy id_user sau khi client render
  useEffect(() => {
    const userId = localStorage.getItem("id_user");
    setIdUser(userId);
  }, []);

  useEffect(() => {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    setCart(JSON.parse(savedCart));
  } else {
    setCart([]);
  }
}, []);

 useEffect(() => {
  async function fetchCart() {
    // Lấy user từ localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const id_user = user ? user.id : 10; // 👉 Nếu chưa đăng nhập thì mặc định là 10
    console.log("🟢 ID user hiện tại:", id_user);
    try {
      const res = await fetch(`http://localhost:3000/api/cart?id_user=${id_user}`);
      const data = await res.json();
      console.log("🟢 Dữ liệu giỏ hàng nhận được:", data);
      setCart(data);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
    }
  }

  fetchCart();
}, []);


  // 🔹 Submit đơn hàng
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    const idUser = localStorage.getItem("user_id");
    const orderData = {
      ...formData,
      
      id_user: idUser,
      items: cart.map((item) => ({
        id_san_pham: item.id_san_pham,
        so_luong: item.so_luong,
        gia: item.gia,
      })),
      phuong_thuc: phuongThucThanhToan, // Gửi phương thức
    };

    try {
      const res = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        // Xóa giỏ hàng
        localStorage.removeItem("cart");
        setCart([]);
        if (idUser) {
      try {
         await fetch(`http://localhost:3000/api/cart?id_user=${idUser}`, { method: "DELETE" });

        console.log("🗑️ Giỏ hàng đã được xóa trong DB");
      } catch (err) {
        console.error("❌ Lỗi khi xóa giỏ hàng trong DB:", err);
      }
    }

        if (phuongThucThanhToan === "online") {
          const paymentRes = await fetch("http://localhost:3000/api/vnpay/create_payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              don_hang_id: data.don_hang_id,
              tong_tien: data.tong_tien,
            }),
          });

          const paymentData = await paymentRes.json();
          if (paymentData.success) {
            window.location.href = paymentData.paymentUrl; // Chuyển sang VNPay ẢO
          } else {
            alert("Lỗi: " + paymentData.error);
          }
        } else {
          // COD: Hiển thị thông báo
          alert(`Đặt hàng thành công! Mã đơn: ${data.don_hang_id}\nChúng tôi sẽ giao hàng và thu tiền tại nhà.`);
          window.location.href = "/don-hang-cua-toi"; // Trang đơn hàng
        }
      } else {
        alert(data.error || "Đặt hàng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
    }
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bên trái: Form đặt hàng */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-blue-600 mb-4">
          Thông tin đặt hàng
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Các input cũ */}
          {/* <input type="text" placeholder="Họ tên" required className="border rounded px-3 py-2"
            value={formData.ho_ten} onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })} /> */}
          <input
            type="text"
            placeholder="Tên người nhận"
            required
            className="border rounded px-3 py-2"
            value={formData.ten_nguoi_nhan}
            onChange={(e) => setFormData({ ...formData, ten_nguoi_nhan: e.target.value })}
          />
          <input type="text" placeholder="Địa chỉ" required className="border rounded px-3 py-2"
            value={formData.dia_chi} onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })} />
          <input type="text" placeholder="Số điện thoại" required className="border rounded px-3 py-2"
            value={formData.dien_thoai} onChange={(e) => setFormData({ ...formData, dien_thoai: e.target.value })} />
          <textarea placeholder="Ghi chú" className="border rounded px-3 py-2"
            value={formData.ghi_chu} onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })} />

          {/* === THÊM PHƯƠNG THỨC THANH TOÁN === */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700 mb-2">Phương thức thanh toán:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={phuongThucThanhToan === "cod"}
                  onChange={() => setPhuongThucThanhToan("cod")}
                  className="w-4 h-4 text-red-500"
                />
                <span className="flex items-center gap-2">
                  Giao hàng & thu tiền (COD)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={phuongThucThanhToan === "online"}
                  onChange={() => setPhuongThucThanhToan("online")}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="flex items-center gap-2">
                  Thanh toán online (VNPay)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition mt-4"
          >
            {phuongThucThanhToan === "online" ? "Tiếp tục thanh toán" : "Đặt hàng ngay"}
          </button>
        </form>
      </div>

      {/* Bên phải: Chi tiết đơn hàng */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-semibold text-blue-600 mb-5 text-center">
          🛒 Chi tiết đơn hàng
        </h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500">Giỏ hàng của bạn đang trống</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-3 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.hinh}
                    alt={item.ten_san_pham}
                    className="w-14 h-14 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.ten_san_pham}</p>
                    <p className="text-sm text-gray-500">Màu: {item.mau_sac}</p>
                    <p className="text-sm text-gray-500">
                      Số lượng: <span className="font-semibold">{item.so_luong}</span>
                    </p>
                  </div>
                </div>

                <span className="text-blue-600 font-semibold">
                  {(item.so_luong * item.gia).toLocaleString()}đ
                </span>
              </li>
            ))}

            <li className="flex justify-between items-center pt-4 border-t font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-red-500">
                {cart
                  .reduce((sum, i) => sum + i.so_luong * i.gia, 0)
                  .toLocaleString()}đ
              </span>
            </li>
          </ul>
        )}
      </div>

    </div>
  );
}
