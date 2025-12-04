"use client";

import React, { useEffect, useState } from "react";
import "./NewsList.css";

interface TinTuc {
  id: number;
  tieu_de: string;
  slug: string;
  mo_ta: string;
  hinh: string;
  ngay: string;
  noi_dung: string;
  luot_xem: number;
  id_loai: number;
}

type TinTucForm = {
  tieu_de: string;
  slug: string;
  mo_ta: string;
  hinh: string;
  ngay: string;
  noi_dung: string;
  id_loai: number;
};

type EditMode = "none" | "create" | "edit";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

export default function NewsList() {
  const [list, setList] = useState<TinTuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<EditMode>("none");
  const [editing, setEditing] = useState<TinTuc | null>(null);
  const [form, setForm] = useState<TinTucForm>({
    tieu_de: "",
    slug: "",
    mo_ta: "",
    hinh: "",
    ngay: "",
    noi_dung: "",
    id_loai: 1,
  });
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<TinTuc | null>(null);
  const [toast, setToast] = useState<ToastState>(null);3
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);


  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tin_tuc");
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Loi load tin tuc:", err);
      showToast("Không thể tải danh sách tin tức", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
   
    try {
      const res = await fetch(`/api/tin_tuc/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadData();
      showToast(`Đã xóa tin tức #${id}`, "success");
    } catch (err) { 
      console.error("Loi xoa tin tuc:", err);
      showToast("Xóa tin tức thất bại", "error");
    }
  };

  // Ham tao form moi (create)
  const startCreate = () => {
    setViewing(null);
    setForm({
      tieu_de: "",
      slug: "",
      mo_ta: "",
      hinh: "",
      ngay: "",
      noi_dung: "",
      id_loai: 1,
    });
    setEditing(null);
    setMode("create");
  };

  // Ham bat dau sua
  const startEdit = (item: TinTuc) => {
    setViewing(null);

    let ngayInput = "";
    try {
      const d = new Date(item.ngay);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      ngayInput = `${y}-${m}-${dd}`;
    } catch {
      ngayInput = item.ngay;
    }

    setEditing(item);
    setForm({
      tieu_de: item.tieu_de,
      slug: item.slug,
      mo_ta: item.mo_ta,
      hinh: item.hinh,
      ngay: ngayInput,
      noi_dung: item.noi_dung,
      id_loai: item.id_loai,
    });
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("none");
    setEditing(null);
  };

  // Optional: tu dong tao slug khi nhap tieu de neu slug dang rong
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((old) => {
      const next: TinTucForm = {
        ...old,
        [name]: name === "id_loai" ? Number(value) : value,
      };

      // Auto tao slug tu tieu de neu mode create va slug dang rong
      if (name === "tieu_de" && (mode === "create" || mode === "edit")) {
        if (!old.slug || old.slug.trim() === "") {
          next.slug = generateSlug(value);
        }
      }

      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "create") {
        await fetch("/api/tin_tuc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast("Đã thêm tin tức mới", "success");
      } else if (mode === "edit" && editing) {
        await fetch(`/api/tin_tuc/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        showToast(`Đã cập nhật tin tức #${editing.id}`, "success");
      }
      await loadData();
      setMode("none");
      setEditing(null);
    } catch (err) {
      console.error("Loi luu tin tuc:", err);
      showToast("Lưu tin tức thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const openView = (item: TinTuc) => {
    setMode("none");
    setEditing(null);
    setViewing(item);
  };

  const closeView = () => setViewing(null);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="news-wrapper">
      <div className="news-header">
        <div>
          <h2 className="news-title">Quản lý Tin tức</h2>
          <p className="news-subtitle">
            Thêm, sửa, xóa và quản lý các bài viết tin tức trên hệ thống.
          </p>
        </div>
        <button className="btn btn-primary" onClick={startCreate}>
          + Thêm tin mới
        </button>
      </div>

      {loading ? (
        <p className="news-loading">Đang tải dữ liệu...</p>
      ) : list.length === 0 ? (
        <div className="news-empty">
          <p>Chưa có tin tức nào. Hãy tạo bài viết đầu tiên!</p>
          <button className="btn btn-primary" onClick={startCreate}>
            + Thêm tin mới
          </button>
        </div>
      ) : (
        <div className="news-table-wrapper">
          <table className="news-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Ảnh</th>
                <th className="col-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td className="col-title">
                    <div className="news-title-cell">
                      <span className="news-title-main">{n.tieu_de}</span>
                      <span className="news-slug">Slug: {n.slug}</span>
                    </div>
                  </td>
                  <td className="col-desc">
                    <span className="news-desc-text">{n.mo_ta}</span>
                  </td>
                  <td>
                    <span className="news-date-badge">
                      {new Date(n.ngay).toLocaleDateString("vi-VN")}
                    </span>
                  </td>
                  <td>
                    {n.hinh && (
                      <img
                        src={n.hinh}
                        className="news-thumb"
                        alt={n.tieu_de}
                      />
                    )}
                  </td>
                  <td className="col-actions">
                    <div className="news-actions">
                      <button
                        className="btn btn-ghost btn-small"
                        onClick={() => openView(n)}
                      >
                        Xem
                      </button>
                      <button
                        className="btn btn-ghost btn-small"
                        onClick={() => startEdit(n)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => deleteItem(n.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal them / sua */}
      {mode !== "none" && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="modal-title">
              {mode === "create"
                ? "Thêm tin tức mới"
                : `Sửa tin tức #${editing?.id}`}
            </h3>

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row">
                <label>Tiêu đề</label>
                <input
                  name="tieu_de"
                  value={form.tieu_de}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label>Slug (đường dẫn)</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Tiêu đề nhỏ"
                  required
                />
              </div>

              <div className="form-row">
                <label>Mô tả</label>
                <textarea
                  name="mo_ta"
                  value={form.mo_ta}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <label>Nội dung</label>
                <textarea
                  name="noi_dung"
                  value={form.noi_dung}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-row">
                  <label>Hình (URL)</label>
                  <input
                    name="hinh"
                    value={form.hinh}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Ngày</label>
                  <input
                    type="date"
                    name="ngay"
                    value={form.ngay}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>ID loại</label>
                  <input
                    type="number"
                    name="id_loai"
                    value={form.id_loai}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelEdit}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : mode === "create"
                    ? "Thêm mới"
                    : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem tin */}
      {viewing && (
        <div className="modal-backdrop">
          <div className="modal modal-view">
            <h3 className="modal-title">{viewing.tieu_de}</h3>
            <div className="news-view-meta">
              <span className="news-date-badge">
                {new Date(viewing.ngay).toLocaleDateString("vi-VN")}
              </span>
              <span className="news-slug">Slug: {viewing.slug}</span>
            </div>

            {viewing.hinh && (
              <div className="news-view-image-wrap">
                <img
                  src={viewing.hinh}
                  alt={viewing.tieu_de}
                  className="news-view-image"
                />
              </div>
            )}

            <div className="news-view-content">{viewing.noi_dung}</div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeView}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast ${
            toast.type === "success" ? "toast-success" : "toast-error"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
