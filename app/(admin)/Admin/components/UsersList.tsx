"use client";

import React from 'react';
import styles from '../admin.module.css';

interface UserRow {
  id: string;
  ho_ten?: string;
  email?: string;
  vai_tro: number | string; // 1 admin, 0 user
  trang_thai?: 'active' | 'locked';
}

interface Props {
  users: UserRow[];
  onChangeRole: (u: UserRow, role: number | string) => void;
  onToggleActive: (u: UserRow) => void;
}

export default function UsersList({ users, onChangeRole, onToggleActive }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeadRow}>
            <th className={styles.th}>Họ tên</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>Quyền</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.td}>
                <div className={styles.emptyMsg}>Không có người dùng.</div>
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id} className={styles.td}>
              <td className={styles.td}>{u.ho_ten || '—'}</td>
              <td className={styles.td}>{u.email || '—'}</td>
              <td className={styles.td}>
                <select aria-label={`role ${u.email || u.ho_ten || u.id}`} value={String(u.vai_tro)} onChange={(e) => onChangeRole(u, e.target.value)} className={styles.inputField}>
                  <option value="1">Admin</option>
                  <option value="0">User</option>
                </select>
              </td>
              <td className={styles.td}>{u.trang_thai === 'locked' ? 'Locked' : 'Active'}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button onClick={() => onToggleActive(u)} className={styles.actionBtn}>{u.trang_thai === 'locked' ? 'Mở khóa' : 'Khóa'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}