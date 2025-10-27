"use client";
import { useEffect, useState } from "react";
import { ISanPham } from "../components/cautrucdata";
import ShowSP from "../components/ShowSP";

export default function SanPhamPage() {
  const [products, setProducts] = useState<ISanPham[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loaiXe, setLoaiXe] = useState<"xeMay" | "oto">("xeMay"); // ✅ phân loại

  useEffect(() => {
    const apiUrl =
      loaiXe === "xeMay"
        ? `http://localhost:3000/api/san_pham/an_hien_2?page=${page}&limit=12`
        : `http://localhost:3000/api/san_pham/an_hien_3?page=${page}&limit=12`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        // backend trả khác nhau: data.data hoặc data.pagination
        setProducts(data.data || []);
        setTotalPages(
          data.pagination?.totalPages || data.totalPages || 1
        );
      })
      .catch((err) => console.error("Lỗi khi load sản phẩm:", err));
  }, [page, loaiXe]);

  return (
    <div className="w-[90%] mx-auto my-6">
      <h2 className="text-center font-bold text-red-600 text-2xl uppercase mb-6">
        {loaiXe === "xeMay" ? "Phụ tùng xe máy" : "Phụ tùng ô tô"}
      </h2>

      {/*Bộ chọn danh mục */} 
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setLoaiXe("xeMay");
            setPage(1);
          }}
          className={`px-5 py-2 rounded-full font-semibold border transition duration-300 ${
            loaiXe === "xeMay"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
          }`}
        >
          Phụ tùng xe máy
        </button>

        <button
          onClick={() => {
            setLoaiXe("oto");
            setPage(1);
          }}
          className={`px-5 py-2 rounded-full font-semibold border transition duration-300 ${
            loaiXe === "oto"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
          }`}
        >
          Phụ tùng ô tô
        </button>
      </div>

      {/* ✅ Danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.length > 0 ? (
          products.map((sp, i) => (
            <div
              key={sp.ma_san_pham || i}
              className="opacity-0 translate-y-4 animate-[fadeInSlow_1.2s_ease-in-out_forwards]"
              style={{ animationDelay: `${i * 0}s` }}
            >
              <ShowSP sp={sp} />
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 italic">
            Không có sản phẩm nào.
          </p>
        )}
      </div>

      {/* ✅ Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ← Trước
        </button>
        <span className="font-semibold">
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Sau →
        </button>
      </div>

      {/* ✅ CSS animation */}
      <style jsx>{`
        @keyframes fadeInSlow {
        from {
          opacity: 0;
          transform: translateY(20px));
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      `}</style>
    </div>
  );
}
