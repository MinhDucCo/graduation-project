"use client";

import React from 'react';
import type { Product } from '../AdminDashboard';
import styles from '../admin.module.css';

interface Props {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}


export default function ProductList({ products, onEdit, onDelete, selectedIds, onToggleSelect, onSelectAll, onClearSelection }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeadRow}>
            <th className={styles.th}>
              <input
                type="checkbox"
                aria-label="select all products"
                onChange={(e) => {
                  if (e.target.checked) onSelectAll && onSelectAll();
                  else onClearSelection && onClearSelection();
                }}
                checked={!!selectedIds && products.every((p) => selectedIds.has(p.id)) && products.length > 0}
              />
            </th>
            <th className={styles.th}>Tên</th>
            <th className={styles.th}>Danh mục</th>
            <th className={styles.th}>Giá</th>
            <th className={styles.th}>Tồn kho</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.td}>
                <div className={styles.emptyMsg}>Không có sản phẩm nào.</div>
              </td>
            </tr>
          )}
          {products.map((p) => (
            <tr key={p.id} className={styles.td}>
              <td className={styles.td}>
                <input
                  type="checkbox"
                  aria-label={`select ${p.name}`}
                  checked={!!selectedIds && selectedIds.has(p.id)}
                  onChange={() => onToggleSelect && onToggleSelect(p.id)}
                />
              </td>
              <td className={styles.td}>
                <div className={styles.productName}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className={styles.thumb} />
                  ) : null}
                  <span className={styles.alignMiddle}>{p.name}</span>
                </div>
                <div className={styles.productDesc}>{p.description}</div>
              </td>
              <td className={styles.td}>{p.category}</td>
              <td className={styles.td}>{p.price?.toLocaleString('vi-VN')} đ</td>
              <td className={styles.td}>{p.stock}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button onClick={() => onEdit(p)} className={styles.actionBtn}>Sửa</button>
                  <button onClick={() => onDelete(p.id)} className={styles.deleteBtn}>Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}