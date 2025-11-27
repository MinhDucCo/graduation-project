"use client";

import React, { useEffect, useState } from "react";

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

export default function NewsList() {
  const [list, setList] = useState<TinTuc[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/tin_tuc");
    const data = await res.json();
    setList(data);
    setLoading(false);
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    await fetch(`/api/tin_tuc/${id}`, {
      method: "DELETE",
    });
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "10px 0" }}>
        Quản lý Tin tức
      </h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="adminTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Ngày</th>
              <th>Ảnh</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {list.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.tieu_de}</td>
                <td>{n.mo_ta}</td>
                <td>{new Date(n.ngay).toLocaleDateString("vi-VN")}</td>
                <td>
                  {n.hinh && <img src={n.hinh} width={70} />}
                </td>
                <td>
                  <button onClick={() => deleteItem(n.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
