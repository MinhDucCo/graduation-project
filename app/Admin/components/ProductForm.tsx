"use client";

import React, { useEffect, useState } from 'react';
import type { Product } from '../AdminDashboard';
import styles from '../admin.module.css';

interface Props {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [category, setCategory] = useState(initial?.category ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  useEffect(() => {
    setName(initial?.name ?? '');
    setPrice(initial?.price ?? 0);
    setStock(initial?.stock ?? 0);
    setCategory(initial?.category ?? '');
    setImageUrl(initial?.imageUrl ?? '');
    setDescription(initial?.description ?? '');
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const product: Product = {
      id: initial?.id ?? '',
      name: name.trim() || 'Untitled',
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      description: description.trim(),
    };
    onSave(product);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
  <h3 className={styles.headerTitle}>{initial ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.formLabel}>Tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={styles.inputField} />
            </div>
            <div>
              <label className={styles.formLabel}>Danh mục</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className={styles.inputField} />
            </div>

            <div>
              <label className={styles.formLabel}>Giá (VND)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={styles.inputField} />
            </div>
            <div>
              <label className={styles.formLabel}>Số lượng</label>
              <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={styles.inputField} />
            </div>

            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Ảnh (URL)</label>
              <input aria-label="image url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={styles.inputField} />
            </div>

            <div className={styles.fullCol}>
              <label className={styles.formLabel}>Mô tả</label>
              <textarea aria-label="description" placeholder="Mô tả ngắn" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={styles.textareaField} />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} className={styles.btn}>Hủy</button>
            <button type="submit" className={styles.btnPrimary}>{initial ? 'Lưu' : 'Tạo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}