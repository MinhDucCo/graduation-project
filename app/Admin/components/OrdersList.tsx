"use client";

import React from 'react';
import type { Order, OrderStatus } from '../AdminDashboard';
import styles from '../admin.module.css';

interface Props {
  orders: Order[];
  onView: (o: Order) => void;
  onChangeStatus: (o: Order, status: OrderStatus) => void;
}

export default function OrdersList({ orders, onView, onChangeStatus }: Props) {
  const statusLabel = (s: OrderStatus) => (
    s === 'pending' ? 'Chờ xử lý' :
    s === 'paid' ? 'Đã thanh toán' :
    s === 'shipping' ? 'Đang giao' :
    s === 'done' ? 'Hoàn tất' :
    'Đã hủy'
  );
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeadRow}>
            <th className={styles.th}>Mã đơn</th>
            <th className={styles.th}>Khách hàng</th>
            <th className={styles.th}>Tổng</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Ngày tạo</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.td}>
                <div className={styles.emptyMsg}>Không có đơn hàng.</div>
              </td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o.id} className={styles.td}>
              <td className={styles.td}>{o.code}</td>
              <td className={styles.td}>{o.customerName}</td>
              <td className={styles.td}>{o.total.toLocaleString('vi-VN')} đ</td>
              <td className={styles.td}>
                <div className={styles.rowInline}>
                  <span className={`${styles.badge} ${o.status==='pending'?styles.badgePending:o.status==='paid'?styles.badgePaid:o.status==='shipping'?styles.badgeShipping:o.status==='done'?styles.badgeDone:styles.badgeCancelled}`}>{statusLabel(o.status)}</span>
                  <select aria-label={`status ${o.code}`} value={o.status} onChange={(e) => onChangeStatus(o, e.target.value as OrderStatus)} className={styles.inputField}>
                    <option value="pending">Chờ xử lý</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="shipping">Đang giao</option>
                    <option value="done">Hoàn tất</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </td>
              <td className={styles.td}>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button onClick={() => onView(o)} className={styles.actionBtn}>Xem</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


