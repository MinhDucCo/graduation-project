"use client";

import React, { useEffect, useState } from "react";
export interface ProductFormData {
  id?: string;
  name: string;
  ten_san_pham?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  an_hien?: number;
  mau_sac?: string;
  hinh_phu1?: string;
  hinh_phu2?: string;
  hinh_phu3?: string;
  ghi_chu?: string;
  id_loai_xe?: number;
    bien_the?: BienThe[];
}

interface Props {
  initial?: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

interface LoaiXe {
  id: number;
  ten_loai: string;
}
export interface BienThe {
  mau_sac?: string;
  gia?: number;
  so_luong?: number;
  hinh?: string;
  hinh_phu1?: string;
  hinh_phu2?: string;
  hinh_phu3?: string;
  ghi_chu?: string;
}

// Danh sách loại xe mẫu (fallback nếu API lỗi)
const LOAI_XE_SEED: LoaiXe[] = [
  { id: 1, ten_loai: "Xe máy" },
  { id: 2, ten_loai: "Xe tay ga" },
  { id: 3, ten_loai: "Ô tô" },
  { id: 4, ten_loai: "Phụ tùng & Đồ chơi" },
];

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(
    initial?.name || initial?.ten_san_pham || ""
  );
 const [stock, setStock] = useState<number>(
  initial?.bien_the
    ? initial.bien_the.reduce((sum, v) => sum + (v.so_luong ?? 0), 0)
    : 0
);

const [price, setPrice] = useState<number>(
  initial?.bien_the && initial.bien_the.length > 0
    ? Number(initial.bien_the[0].gia || 0)
    : 0
);


  const [description, setDescription] = useState(
    initial?.description || ""
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [mauSac, setMauSac] = useState(initial?.mau_sac || "");
  const [hinhPhu1, setHinhPhu1] = useState(initial?.hinh_phu1 || "");
  const [hinhPhu2, setHinhPhu2] = useState(initial?.hinh_phu2 || "");
  const [hinhPhu3, setHinhPhu3] = useState(initial?.hinh_phu3 || "");
  const [ghiChu, setGhiChu] = useState(initial?.ghi_chu || "");
  const [anHien, setAnHien] = useState<number>(
    typeof initial?.an_hien === "number" ? initial.an_hien : 2
  ); // mặc định hiển thị ở danh sách public
  const [idLoaiXe, setIdLoaiXe] = useState<number | undefined>(
    initial?.id_loai_xe
  );

  const [loaiXeList, setLoaiXeList] = useState<LoaiXe[]>([]);
  const [loaiXeLoading, setLoaiXeLoading] = useState(false);
  const [loaiXeError, setLoaiXeError] = useState<string | null>(null);

  // Load danh sách loại xe từ API (có fallback khi lỗi/404)
  useEffect(() => {
    const fetchLoaiXe = async () => {
      setLoaiXeLoading(true);
      setLoaiXeError(null);
      try {
        const url = "http://localhost:3000/api/loai_xe";
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLoaiXeList(data);
          return;
        }
        throw new Error("Dữ liệu loại xe không hợp lệ");
      } catch (err: any) {
        console.warn("⚠️ Lỗi khi load loại xe, dùng danh sách mẫu:", err);
        setLoaiXeList(LOAI_XE_SEED);
        setLoaiXeError(
          "Không tải được danh sách loại xe từ server, đang dùng danh sách mẫu."
        );
      } finally {
        setLoaiXeLoading(false);
      }
    };

    fetchLoaiXe();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!idLoaiXe) {
      alert("Vui lòng chọn loại xe");
      return;
    }

    // ✅ BẮT BUỘC NHẬP GIÁ > 0
    if (price <= 0) {
      alert("Vui lòng nhập giá sản phẩm > 0");
      return;
    }

    // ✅ TỒN KHO KHÔNG ĐƯỢC ÂM
    if (stock < 0) {
      alert("Tồn kho không được nhỏ hơn 0");
      return;
    }

    // (tuỳ bạn) có thể bắt buộc có ảnh chính
    // if (!imageUrl.trim()) {
    //   alert("Vui lòng nhập URL ảnh chính");
    //   return;
    // }
    const payload: ProductFormData = {
  id: initial?.id || "",        // hoặc để initial?.id (vì id?: string)
  name: name.trim(),
  price,
  stock,
  category: "",
  imageUrl: imageUrl.trim(),
  description: description.trim(),
  an_hien: Number(anHien),
  mau_sac: mauSac.trim(),
  hinh_phu1: hinhPhu1.trim(),
  hinh_phu2: hinhPhu2.trim(),
  hinh_phu3: hinhPhu3.trim(),
  ghi_chu: ghiChu.trim(),
  id_loai_xe: idLoaiXe,
};


    onSave(payload);
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {initial ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {loaiXeError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {loaiXeError}
            </div>
          )}

          {/* Tên + loại xe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên sản phẩm
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Nhông xích DID, Bugi NGK..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Loại xe (Danh mục)
              </label>
              <select
                value={idLoaiXe ?? ""}
                onChange={(e) =>
                  setIdLoaiXe(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn loại xe --</option>
                {loaiXeList.map((lx) => (
                  <option key={lx.id} value={lx.id}>
                    {lx.ten_loai}
                  </option>
                ))}
              </select>
              {loaiXeLoading && (
                <p className="text-xs text-gray-400 mt-1">
                  Đang tải danh sách loại xe...
                </p>
              )}
            </div>
          </div>

          {/* Giá + tồn kho + ẩn/hiện */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Giá
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tồn kho (số lượng)
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Trạng thái
              </label>
              <select
                value={anHien}
                onChange={(e) => setAnHien(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Hiển thị (web)</option>
                <option value={0}>Ẩn</option>
                <option value={2}>Hiện ở mục Xe máy</option>
                <option value={3}>Hiện ở mục Ô tô</option>
              </select>
            </div>
          </div>

          {/* Ảnh chính + màu sắc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ảnh chính (URL)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Màu sắc (nếu có)
              </label>
              <input
                type="text"
                value={mauSac}
                onChange={(e) => setMauSac(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Đỏ, Đen, Xanh..."
              />
            </div>
          </div>

          {/* Ảnh phụ */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ảnh phụ (URL) – tùy chọn
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={hinhPhu1}
                onChange={(e) => setHinhPhu1(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ảnh phụ 1"
              />
              <input
                type="text"
                value={hinhPhu2}
                onChange={(e) => setHinhPhu2(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ảnh phụ 2"
              />
              <input
                type="text"
                value={hinhPhu3}
                onChange={(e) => setHinhPhu3(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ảnh phụ 3"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết: chất liệu, ưu điểm, bảo hành..."
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ghi chú nội bộ (không hiển thị khách)
            </label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Hàng mới về, ưu tiên đẩy bán, kiểm tra tồn kho mỗi tuần..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              {initial ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
