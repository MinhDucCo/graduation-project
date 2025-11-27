"use client";

import React, { useEffect, useState } from "react";
import type { Product } from "../AdminDashboard";
import styles from "../admin.module.css";

interface Props {
  initial?: Product;
  onSave: (
    p: Product & {
      id_loai_xe?: number;
      mau_sac?: string;
      hinh_phu1?: string;
      hinh_phu2?: string;
      hinh_phu3?: string;
      ghi_chu?: string;
    }
  ) => void;
  onCancel: () => void;
}

interface LoaiXe {
  id: number;
  ten_loai: string;
}

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [idLoaiXe, setIdLoaiXe] = useState<number | "">("");
  const [loaiXeList, setLoaiXeList] = useState<LoaiXe[]>([]);
  const [loadingLoaiXe, setLoadingLoaiXe] = useState(true);
  const [anHien, setAnHien] = useState<number>(
  (initial as any)?.an_hien ?? 1
);

  // 🟦 State cho BẢNG bien_the_san_pham
  const [mauSac, setMauSac] = useState(
    (initial as any)?.mau_sac ?? "" // nếu lúc edit có sẵn
  );
  const [extraImage1, setExtraImage1] = useState(
    (initial as any)?.hinh_phu1 ?? ""
  );
  const [extraImage2, setExtraImage2] = useState(
    (initial as any)?.hinh_phu2 ?? ""
  );
  const [extraImage3, setExtraImage3] = useState(
    (initial as any)?.hinh_phu3 ?? ""
  );
  const [note, setNote] = useState((initial as any)?.ghi_chu ?? "");

  // Load danh sách loại xe
  useEffect(() => {
    const fetchLoaiXe = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/loai_xe");
        const data = await res.json();
        if (Array.isArray(data)) {
          setLoaiXeList(data);
        }
      } catch (err) {
        console.error("Lỗi khi load loại xe:", err);
      } finally {
        setLoadingLoaiXe(false);
      }
    };
    fetchLoaiXe();
  }, []);

  // Khi initial hoặc loaiXeList đổi thì sync lại form
  useEffect(() => {
    setName(initial?.name ?? "");
    setPrice(initial?.price ?? 0);
    setStock(initial?.stock ?? 0);
    setCategory(initial?.category ?? "");
    setImageUrl(initial?.imageUrl ?? "");
    setDescription(initial?.description ?? "");

    // Gán lại variant nếu có
    setMauSac((initial as any)?.mau_sac ?? "");
    setExtraImage1((initial as any)?.hinh_phu1 ?? "");
    setExtraImage2((initial as any)?.hinh_phu2 ?? "");
    setExtraImage3((initial as any)?.hinh_phu3 ?? "");
    setNote((initial as any)?.ghi_chu ?? "");

    // Tìm id_loai_xe từ category name
    if (initial?.category && loaiXeList.length > 0) {
      const found = loaiXeList.find((lx) => lx.ten_loai === initial.category);
      if (found) {
        setIdLoaiXe(found.id);
      }
    }
  }, [initial, loaiXeList]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idLoaiXe) {
      alert("Vui lòng chọn loại xe!");
      return;
    }

    const product: Product & {
  id_loai_xe?: number;
  an_hien?: number;
  mau_sac?: string;
  hinh_phu1?: string;
  hinh_phu2?: string;
  hinh_phu3?: string;
  ghi_chu?: string;
} = {
  id: initial?.id ?? "",
  name: name.trim() || "Untitled",
  price: Number(price) || 0,
  stock: Number(stock) || 0,
  category: category.trim(),
  imageUrl: imageUrl.trim(),
  description: description.trim(),
  id_loai_xe: Number(idLoaiXe),
  an_hien: anHien,

  // nếu bạn đã có các state này
  mau_sac: mauSac?.trim?.() ?? "",
  hinh_phu1: extraImage1?.trim?.() ?? "",
  hinh_phu2: extraImage2?.trim?.() ?? "",
  hinh_phu3: extraImage3?.trim?.() ?? "",
  ghi_chu: note?.trim?.() ?? "",
};


    onSave(product);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h3 className={styles.headerTitle}>
          {initial ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* TÊN SẢN PHẨM */}
            <div>
              <label className={styles.formLabel}>Tên</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.inputField}
              />
            </div>

            {/* LOẠI XE */}
            <div>
              <label className={styles.formLabel}>Loại xe *</label>
              <div>
  <label className={styles.formLabel}>Trạng thái hiển thị</label>
  <select
    value={anHien}
    onChange={(e) => setAnHien(Number(e.target.value))}
    className={styles.inputField}
  >
    <option value={1}>1 - Hiển thị chung</option>
    <option value={2}>2 - Phụ tùng xe máy (an_hien=2)</option>x``
    <option value={3}>3 - Phụ tùng ô tô (an_hien=3)</option>
    <option value={0}>0 - Ẩn sản phẩm</option>
  </select>
</div>

              {loadingLoaiXe ? (
                <div className={styles.inputField}>Đang tải...</div>
              ) : (
                <select
                  value={idLoaiXe}
                  onChange={(e) => {
                    const selectedId = e.target.value
                      ? Number(e.target.value)
                      : "";
                    setIdLoaiXe(selectedId);
                    const selected = loaiXeList.find(
                      (lx) => lx.id === selectedId
                    );
                    setCategory(selected?.ten_loai || "");
                  }}
                  className={styles.inputField}
                  required
                >
                 
                </select>
              )}
            </div>
              
            {/* GIÁ + SỐ LƯỢNG */}
            <div>
              <label className={styles.formLabel}>Giá (VND)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={styles.inputField}
              />
            </div>
            <div>
              <label className={styles.formLabel}>Số lượng</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className={styles.inputField}
              />
            </div>

            {/* MÀU SẮC (thuộc bien_the_san_pham) */}
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Màu sắc (biến thể)</label>
              <input
                placeholder="VD: Đỏ, Đen, Xanh..."
                value={mauSac}
                onChange={(e) => setMauSac(e.target.value)}
                className={styles.inputField}
              />
            </div>

            {/* ẢNH CHÍNH */}
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ảnh chính (URL)</label>
              <input
                aria-label="image url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={styles.inputField}
              />
              {imageUrl && (
                <div style={{ marginTop: "8px" }}>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "4px",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* ẢNH PHỤ */}
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ảnh phụ 1 (URL)</label>
              <input
                placeholder="https://..."
                value={extraImage1}
                onChange={(e) => setExtraImage1(e.target.value)}
                className={styles.inputField}
              />
            </div>
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ảnh phụ 2 (URL)</label>
              <input
                placeholder="https://..."
                value={extraImage2}
                onChange={(e) => setExtraImage2(e.target.value)}
                className={styles.inputField}
              />
            </div>
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ảnh phụ 3 (URL)</label>
              <input
                placeholder="https://..."
                value={extraImage3}
                onChange={(e) => setExtraImage3(e.target.value)}
                className={styles.inputField}
              />
            </div>

            {/* MÔ TẢ + GHI CHÚ */}
            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Mô tả</label>
              <textarea
                aria-label="description"
                placeholder="Mô tả ngắn"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={styles.textareaField}
              />
            </div>

            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ghi chú (cho biến thể)</label>
              <textarea
                placeholder="Ghi chú thêm cho biến thể (nếu có)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className={styles.textareaField}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.btn}
            >
              Hủy
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {initial ? "Lưu" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
