'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface IUser {
  id: number;
  email: string;
  ho_ten: string;
  dia_chi?: string;
  dien_thoai?: string;
  vai_tro?: string;
  hinh?: string;
}

export default function NguoiDungPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('⚠️ Bạn chưa đăng nhập!');
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          👤 Thông tin tài khoản
        </h1>

        <div className="flex items-center gap-6 border-b pb-4 mb-6">
          <img
            src={user.hinh || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <p><strong>Họ tên:</strong> {user.ho_ten || 'Chưa có'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Điện thoại:</strong> {user.dien_thoai || 'Chưa có'}</p>
            <p><strong>Địa chỉ:</strong> {user.dia_chi || 'Chưa có'}</p>
            <p>
              <strong>Vai trò:</strong>{' '}
              {user.vai_tro === '1' ? 'Admin' : 'Người dùng'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('user');
            alert('Đã đăng xuất!');
            router.push('/Register');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
