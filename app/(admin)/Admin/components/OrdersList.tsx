"use client";

import React from "react";
import type { Order, OrderStatus } from "../AdminDashboard";
import styles from "../admin.module.css";

interface Props {
  orders?: Order[];
  onView: (o: Order) => void;
  onChangeStatus: (o: Order, status: OrderStatus) => void;
}

export default function OrdersList({ orders, onView, onChangeStatus }: Props) {
  const safeOrders: Order[] = Array.isArray(orders) ? orders : [];

  const statusLabel = (s: OrderStatus) =>
    s === "pending"
      ? "Chờ xử lý"
      : s === "paid"
      ? "Đã thanh toán"
      : s === "shipping"
      ? "Đang giao"
      : s === "done"
      ? "Hoàn tất"
      : "Đã hủy";

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeadRow}>
            <th className={styles.th}>Mã đơn</th>
            <th className={styles.th}>Khách hàng</th>
            <th className={styles.th}>Tổng</th>

            {/* 👇 THÊM CỘT SỐ LƯỢNG */}
            <th className={styles.th}>Số lượng</th>

            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Ngày đặt</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {safeOrders.length === 0 && (
            <tr>
              <td colSpan={7} className={styles.td}>
                <div className={styles.emptyMsg}>Không có đơn hàng.</div>
              </td>
            </tr>
          )}

          {safeOrders.map((o) => (
            <tr key={o.id} className={styles.tableRow}>
              <td className={styles.td}>{o.id}</td>

              <td className={styles.td}>{o.ten_nguoi_nhan}</td>

              <td className={styles.td}>
                {Number(o.total || 0).toLocaleString("vi-VN")} đ
              </td>

              {/* 👇 HIỂN THỊ SỐ LƯỢNG */}
              <td className={styles.td}>
                {o.so_luong ?? 0}
              </td>

              <td className={styles.td}>
                <div className={styles.rowInline}>
                  <span
                    className={`${styles.badge} ${
                      o.status === "pending"
                        ? styles.badgePending
                        : o.status === "paid"
                        ? styles.badgePaid
                        : o.status === "shipping"
                        ? styles.badgeShipping
                        : o.status === "done"
                        ? styles.badgeDone
                        : styles.badgeCancelled
                    }`}
                  >
                    {statusLabel(o.status)}
                  </span>

                  <select
                    aria-label={`status ${o.id}`}
                    value={o.status}
                    onChange={(e) =>
                      onChangeStatus(o, e.target.value as OrderStatus)
                    }
                    className={styles.inputField}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="shipping">Đang giao</option>
                    <option value="done">Hoàn tất</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </td>

              <td className={styles.td}>
                {o.ngay_dat
                  ? new Date(o.ngay_dat).toLocaleString("vi-VN")
                  : ""}
              </td>

              <td className={styles.td}>
                <div className={styles.actions}>
                  <button
                    onClick={() => onView(o)}
                    className={styles.actionBtn}
                  >
                    Xem
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
