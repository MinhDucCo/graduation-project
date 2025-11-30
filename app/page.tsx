"use client";

import { useEffect, useState } from "react";
import { ISanPham } from "@/app/components/cautrucdata";
import ShowSP from "@/app/components/ShowSP";

// 🔥 Sản phẩm bán chạy
// Helper: chuẩn hoá mảng sản phẩm
const normalizeProducts = (arr: any[]) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((x: any) => {
    const copy: any = { ...x };

    if (Array.isArray(copy.bien_the_san_phams) && copy.bien_the_san_phams.length > 0) {
      return copy;
    }

    const variant: any = {
      gia: copy.gia ?? copy.price ?? 0,
      so_luong: copy.so_luong ?? copy.stock ?? 0,
      hinh: copy.hinh ?? copy.imageUrl ?? "",
      mau_sac: copy.mau_sac ?? "",
    };

    copy.bien_the_san_phams = [variant];
    return copy;
  });
};

function SanPhamBanChay() {
  const [sp_hot, setSpHot] = useState<ISanPham[]>([]);

  useEffect(() => {
    const fetchSP = async () => {
      try {
        const resHot = await fetch("http://localhost:3000/api/sanpham_hot");
        const data = await resHot.json();
        console.log("🔥 API phu_tung_xe:", data); // 👉 in ra để xem API trả về gì

        // Hỗ trợ nhiều dạng response:
        // - array trực tiếp
        // - { sp_hot: [...] }
        // - { data: [...] }
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data?.sp_hot)) arr = data.sp_hot;
        else if (Array.isArray(data?.data)) arr = data.data;

        if (!Array.isArray(arr)) {
          console.warn("API /sanpham_hot không trả về mảng, dùng fallback rỗng.", data);
          arr = [];
        }

        // Chuẩn hoá mỗi phần tử để component ShowSP luôn có thể đọc `bien_the_san_phams`
        const normalized = arr.map((x: any) => {
          const copy: any = { ...x };

          // Nếu backend trả bien_the_san_phams thì giữ nguyên
          if (Array.isArray(copy.bien_the_san_phams) && copy.bien_the_san_phams.length > 0) {
            return copy;
          }

          // Nếu backend trả top-level fields như `gia`, `hinh`, `so_luong`, tạo biến thể giả
          const variant: any = {
            gia: copy.gia ?? copy.price ?? 0,
            so_luong: copy.so_luong ?? copy.stock ?? 0,
            hinh: copy.hinh ?? copy.imageUrl ?? "",
            mau_sac: copy.mau_sac ?? "",
          };

          copy.bien_the_san_phams = [variant];
          return copy;
        });

        setSpHot(normalized);
      } catch (err) {
        console.error("Lỗi fetch sản phẩm bán chạy:", err);
      }
    };

    fetchSP();
  }, []);
  return (
    <div className="sphot w-[90%] mb-20 mx-auto">
      <h2 className="relative text-center font-bold text-red-600 uppercase my-6 text-[1.5em]">
        <span className="px-4 bg-white">Sản Phẩm Bán Chạy</span>
        <span className="absolute left-0 top-1/2 w-full border-t-2 border-gray-300 -z-10"></span>
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {sp_hot.map((sp) => (
          <ShowSP key={sp.ma_san_pham} sp={sp} />
        ))}
      </div>

    </div>
  );
}

// 🚗 Xe Máy
function SanPhamXeMay() {
  const [sp_an_hien2, setSpAnHien2] = useState<ISanPham[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  useEffect(() => {
    const fetchSP = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/san_pham/an_hien_2?page=${page}&limit=${limit}`
        );
        const data = await res.json();
        console.log("🔥 API an_hien_2:", data); // kiểm tra trả về
        const items = normalizeProducts(data?.data || []);
        setSpAnHien2(items); // ✅ chỉ lấy mảng sản phẩm
        setTotalPages(data?.pagination?.totalPages || 1); // ✅ lấy tổng số trang
      } catch (err) {
        console.error("Lỗi fetch sản phẩm Xe Máy:", err);
      }
    };
    fetchSP();
  }, [page]);

  return (
    <div className="sphot w-[90%] mb-20 mx-auto">
      <h2 className="relative font-bold text-red-600 uppercase my-6 text-[1.5em] border-b-2 border-gray-300">
        <span className="bg-white pr-4">PHỤ TÙNG XE MÁY</span>
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {sp_an_hien2.map((sp, i) => (
          <div
            key={sp.ma_san_pham}
            className={`
            opacity-0 translate-y-4
            animate-[fadeInSlow_1.2s_ease-in-out_forwards]
          `}
            style={{ animationDelay: `${i * 0}s` }} // hiện lần lượt
          >
            <ShowSP sp={sp} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-blue-700 text-white font rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          ⬅ Trước
        </button>
        <span className="px-4 py-2 font-bold text-black-700">
          {page}/{totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-blue-700 text-white font rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          Sau ➡
        </button>
      </div>
      {/* CSS thủ công */}
      <style jsx>{`
      @keyframes fadeInSlow {
        from {
          opacity: 0;
          transform: translateY(20px);
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

// 🚙 Ôtô
function PhuTungOto() {
  const [sp_an_hien3, setSpAnHien3] = useState<ISanPham[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  useEffect(() => {
    const fetchSP = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/san_pham/an_hien_3?page=${page}&limit=${limit}`
        );
        const data = await res.json();
        const items = normalizeProducts(data?.data || []);
        setSpAnHien3(items);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Lỗi fetch sản phẩm Ô tô:", err);
      }
    };
    fetchSP();
  }, [page]);

  return (
    <div className="sphot w-[90%] mb-20 mx-auto">
      <h2 className="relative font-bold text-red-600 uppercase my-6 text-[1.5em] border-b-2 border-gray-300">
        <span className="bg-white pr-4">PHỤ TÙNG ÔTÔ</span>
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {sp_an_hien3.map((sp, i) => (
          <div
            key={sp.ma_san_pham}
            className="opacity-0 translate-y-4 animate-[fadeInSlow_1.2s_ease-in-out_forwards]"
            style={{ animationDelay: `${i * 0}s` }} // hiện lần lượt
          >
            <ShowSP sp={sp} />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-blue-700 text-white font rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          ⬅ Trước
        </button>
        <span className="px-4 py-2 font-bold text-black-700">
          {page}/{totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-blue-700 text-white font rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          Sau ➡
        </button>

      </div>

      {/* CSS animation slow motion */}
      <style jsx>{`
      @keyframes fadeInSlow {
        from {
          opacity: 0;
          transform: translateY(20px);
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

//  Page chính 
export default function SanPhamPage() {
  return (
    <div>
      <SanPhamBanChay />   {/* 👈 hiện trên đầu */}
      <SanPhamXeMay />
      <PhuTungOto />
    </div>
  );
}
