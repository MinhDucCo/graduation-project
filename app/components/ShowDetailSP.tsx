"use client";
import { ISanPham, IBienThe } from "../components/cautrucdata";
import { useState, useEffect } from "react";

export default function ShowDetailSP({ sp }: { sp: ISanPham }) {
  // Lấy biến thể đầu tiên (nếu có)
 const firstVariant = sp.bien_the_san_phams?.[0] || undefined;
  

  // Danh sách hình: hình chính + hình phụ
  const hinhPhu = [
  firstVariant?.hinh || "https://via.placeholder.com/400x300?text=Hinh+Chinh",
  firstVariant?.hinh_phu1 || "https://placehold.co/400x300?text=Hinh+Phu+1",
  firstVariant?.hinh_phu2 || "https://placehold.co/400x300?text=Hinh+Phu+2",
  firstVariant?.hinh_phu3 || "https://placehold.co/400x300?text=Hinh+Phu+3",
];


  const [hinhChinh, setHinhChinh] = useState<string>(hinhPhu[0]);


  // Kiểm tra lỗi tải ảnh
  useEffect(() => {
    const img = new Image();
    img.src = hinhChinh;
    img.onload = () => console.log("Hình chính tải thành công:", hinhChinh);
    img.onerror = () => setHinhChinh("https://via.placeholder.com/400x300?text=Loi+Tai+Hinh");
  }, [hinhChinh]);
  console.log(sp.bien_the_san_phams);
  console.log("Sản phẩm:", sp);
  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh */}
        <div className="md:w-1/2">
          <img
            src={hinhChinh}
            alt={sp.ten_san_pham}
            className="w-full h-[450px] object-cover rounded-lg shadow-md"
          />
          <div className="flex gap-4 mt-4">
            {hinhPhu.map((hinh, index) => (
              <img
                key={index}
                src={hinh}
                alt={`Hình phụ ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition 
                  ${hinhChinh === hinh ? "border-blue-600" : "border-gray-200"}`}
                onClick={() => setHinhChinh(hinh)}
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x300?text=Loi+Tai+Hinh+Phu")}
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">{sp.ten_san_pham}</h3>
            <p className="text-2xl text-red-600 font-semibold mb-4">
              {firstVariant ? Number(firstVariant.gia).toLocaleString("vi-VN") + " ₫" : "Chưa có giá"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Màu sắc:</b> {firstVariant?.mau_sac || "Chưa có"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Số lượng:</b> {firstVariant?.so_luong ?? "Chưa có"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Mô tả:</b> {sp.mo_ta}
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2">
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
