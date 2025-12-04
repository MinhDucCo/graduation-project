"use client";

import React from "react";
import type { Order, OrderStatus } from "../AdminDashboard";
import styles from "../admin.module.css";

interface Props {
  orders?: Order[];
  onView: (o: Order) => void;
  onChangeStatus: (o: Order, status: OrderStatus) => void;

  // trang thai dung de filter: "all" = tat ca, hoac tung status
  statusFilter?: OrderStatus | "all";
}

export default function OrdersList({
  orders,
  onView,
  onChangeStatus,
  statusFilter = "all",
}: Props) {
  const safeOrders: Order[] = Array.isArray(orders) ? orders : [];

  // text hien thi cho tung trang thai
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

  // don hoan tat hoac da huy khong the thay doi trang thai
  const isLockedStatus = (s: OrderStatus) =>
    s === "done" || s === "cancelled";

  // tra ve cac option duoc phep cho trang thai hien tai
  const getStatusOptionsForSelect = (
    current: OrderStatus
  ): { value: OrderStatus; label: string }[] => {
    // don dang giao: chi cho "dang giao" va "hoan tat"
    if (current === "shipping") {
      return [
        { value: "shipping", label: "Đang giao" },
        { value: "done", label: "Hoàn tất" },
      ];
    }

    // don hoan tat: chi hien "hoan tat"
    if (current === "done") {
      return [{ value: "done", label: "Hoàn tất" }];
    }

    // don da huy: chi hien "da huy"
    if (current === "cancelled") {
      return [{ value: "cancelled", label: "Đã hủy" }];
    }

    // mac dinh (pending, paid): cho full
    return [
      { value: "pending", label: "Chờ xử lý" },
      { value: "paid", label: "Đã thanh toán" },
      { value: "shipping", label: "Đang giao" },
      { value: "done", label: "Hoàn tất" },
      { value: "cancelled", label: "Đã hủy" },
    ];
  };

  // loc theo statusFilter
  const filteredOrders =
    statusFilter === "all"
      ? safeOrders
      : safeOrders.filter((o) => o.status === statusFilter);

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeadRow}>
            <th className={styles.th}>Mã đơn</th>
            <th className={styles.th}>Khách hàng</th>
            <th className={styles.th}>Tổng</th>
            <th className={styles.th}>Số lượng</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Ngày đặt</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={7} className={styles.td}>
                <div className={styles.emptyMsg}>Không có đơn hàng.</div>
              </td>
            </tr>
          )}

          {filteredOrders.map((o) => (
            <tr key={o.id} className={styles.tableRow}>
              <td className={styles.td}>{o.id}</td>

              <td className={styles.td}>{o.ten_nguoi_nhan}</td>

              <td className={styles.td}>
                {Number(o.total || 0).toLocaleString("vi-VN")} đ
              </td>

              <td className={styles.td}>{o.so_luong ?? 0}</td>

              <td className={styles.td}>
                <div className={styles.rowInline}>
                  <span
                    className={`${styles.badge} ${o.status === "pending"
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
                    disabled={isLockedStatus(o.status)}
                    onChange={(e) => {
                      if (isLockedStatus(o.status)) return;
                      onChangeStatus(o, e.target.value as OrderStatus);
                    }}
                    className={styles.inputField}
                  >
                    {getStatusOptionsForSelect(o.status).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
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
