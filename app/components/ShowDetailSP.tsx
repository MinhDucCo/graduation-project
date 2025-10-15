"use client";
import { ISanPham, IBienThe } from "../components/cautrucdata";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShowDetailSP({ sp }: { sp: ISanPham }) {
  const [selectedVariant, setSelectedVariant] = useState<IBienThe | undefined>(
    sp.bien_the_san_phams?.[0]
  );

  const router = useRouter();

  // Danh sách hình ảnh dựa theo biến thể
  const hinhPhu = [
    selectedVariant?.hinh ||
    "https://via.placeholder.com/400x300?text=Hinh+Chinh",
    selectedVariant?.hinh_phu1 ||
    "https://placehold.co/400x300?text=Hinh+Phu+1",
    selectedVariant?.hinh_phu2 ||
    "https://placehold.co/400x300?text=Hinh+Phu+2",
    selectedVariant?.hinh_phu3 ||
    "https://placehold.co/400x300?text=Hinh+Phu+3",
  ];

  const [hinhChinh, setHinhChinh] = useState<string>(hinhPhu[0]);

  useEffect(() => {
    setHinhChinh(hinhPhu[0]);
  }, [selectedVariant]);

  useEffect(() => {
    const img = new Image();
    img.src = hinhChinh;
    img.onerror = () =>
      setHinhChinh("https://via.placeholder.com/400x300?text=Loi+Tai+Hinh");
  }, [hinhChinh]);

  // 🛒 Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn màu sắc sản phẩm!");
      return;
    }

    try {
      // dữ liệu gửi lên API (trùng tên với cột trong bảng `gio_hang`)
      const data = {
        ten_san_pham: sp.ten_san_pham,
        gia: selectedVariant.gia,
        id_user: 1,
        id_san_pham: sp.ma_san_pham, // dùng fallback
        so_luong: 1,
        hinh: selectedVariant.hinh,
        mau_sac: selectedVariant.mau_sac,
      };
      console.log("🔍 selectedVariant:", selectedVariant);
      console.log("📦 Dữ liệu thêm giỏ hàng:", data);
      
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();


      // if (res.ok) {
      //   alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
      //   router.push("/AddToCart");
      // } else {
      //   alert("❌ Thêm thất bại: " + result.message);
      // }
    } catch (error) {
      console.error("🚨 Lỗi khi thêm giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ảnh sản phẩm */}
        <div className="md:w-1/2">
          <img
            src={hinhChinh}
            alt={sp.ten_san_pham}
            className="w-full h-[400px] object-cover rounded-lg shadow-md"
          />
          <div className="flex gap-4 mt-4">
            {hinhPhu.map((hinh, index) => (
              <img
                key={index}
                src={hinh}
                alt={`Hình phụ ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition ${hinhChinh === hinh
                    ? "border-blue-600"
                    : "border-gray-200 hover:border-gray-400"
                  }`}
                onClick={() => setHinhChinh(hinh)}
                onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/400x300?text=Loi+Tai+Hinh+Phu")
                }
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {sp.ten_san_pham}
            </h3>

            {/* Giá */}
            <p className="text-2xl text-red-600 font-semibold mb-4">
              {selectedVariant
                ? Number(selectedVariant.gia).toLocaleString("vi-VN") + " ₫"
                : "Chưa có giá"}
            </p>

            {/* Màu sắc */}
            <div className="mb-4">
              <b>Màu sắc:</b>
              <div className="flex gap-2 mt-2 flex-wrap">
                {sp.bien_the_san_phams?.map((bt, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(bt)}
                    className={`px-4 py-2 rounded-lg border transition ${selectedVariant?.id === bt.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                      }`}
                  >
                    {bt.mau_sac}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-gray-700 mb-2">
              <b>Số lượng còn:</b> {selectedVariant?.so_luong ?? "Không có"}
            </p>

            <p className="text-gray-700 mb-2">
              <b>Mô tả:</b> {sp.mo_ta}
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
            >
              🛒 Thêm vào giỏ hàng
            </button>

            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2">
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
