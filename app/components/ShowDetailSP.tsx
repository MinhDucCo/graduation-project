
//  TRANG CHI TIẾT SẢN PHẨM
"use client";
import { ISanPham } from "../components/cautrucdata";
import { useState, useEffect } from "react";

export default function ShowDetailSP({ sp }: { sp: ISanPham }) {
  // Danh sách hình: hình chính + hình phụ từ database (đường link ảnh)
  const hinhPhu = [
    sp.hinh && sp.hinh.trim() !== "" ? sp.hinh : "https://via.placeholder.com/400x300?text=Hinh+Chinh",
    sp.hinh_phu1 && sp.hinh_phu1.trim() !== "" ? sp.hinh_phu1 : "https://via.placeholder.com/400x300?text=Hinh+Phu+1",
    sp.hinh_phu2 && sp.hinh_phu2.trim() !== "" ? sp.hinh_phu2 : "https://via.placeholder.com/400x300?text=Hinh+Phu+2",
    sp.hinh_phu3 && sp.hinh_phu3.trim() !== "" ? sp.hinh_phu3 : "https://via.placeholder.com/400x300?text=Hinh+Phu+3",
  ];

  const [hinhChinh, setHinhChinh] = useState<string>(
    sp.hinh && sp.hinh.trim() !== "" ? sp.hinh : "https://via.placeholder.com/400x300?text=Hinh+Chinh"
  );

  // Kiểm tra lỗi tải ảnh
  useEffect(() => {
    const img = new Image();
    img.src = hinhChinh;
    img.onload = () => console.log("Hình chính tải thành công:", hinhChinh);
    img.onerror = () => {
      console.error("Lỗi tải hình chính - ERR_NAME_NOT_RESOLVED:", hinhChinh);
      setHinhChinh("https://via.placeholder.com/400x300?text=Loi+Tai+Hinh");
    };
  }, [hinhChinh]);

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white shadow-xl rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh */}
        <div className="md:w-1/2">
          <img
            src={hinhChinh}
            alt={sp.ten_san_pham || "Sản phẩm"}
            className="w-full h-[400px] object-cover rounded-lg shadow-md"
          />
          {/* Danh sách hình phụ */}
          <div className="flex gap-4 mt-4">
            {hinhPhu.map((hinh, index) => (
              <img
                key={index}
                src={hinh}
                alt={`Hình phụ ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition 
                  ${hinhChinh === hinh ? "border-blue-600" : "border-gray-200"}`}
                onClick={() => setHinhChinh(hinh)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error(`Lỗi tải hình phụ ${index + 1} - ERR_NAME_NOT_RESOLVED:`, hinh);
                  target.src = "https://via.placeholder.com/400x300?text=Loi+Tai+Hinh+Phu";
                }}
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
            <p className="text-2xl text-red-600 font-semibold mb-4">
              {Number(sp.gia).toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-gray-700 mb-2">
              <b>Mô tả:</b> {sp.mo_ta}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Màu sắc:</b> {sp.mau_sac || "Chưa có"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Số lượng:</b> {sp.so_luong}
            </p>
          </div>

          <button
            type="button"
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}