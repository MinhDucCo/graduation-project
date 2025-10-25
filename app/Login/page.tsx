'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mat_khau: matKhau }),
      });

      console.log('[Login] response status', res.status, res.statusText);

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }


      console.log('[Login] response body', data);

      if (res.ok) {
        alert('✅ ' + (data.message || 'Đăng nhập thành công'));

        // 🔹 Lưu thông tin user vào localStorage để sử dụng sau này
        localStorage.setItem('user', JSON.stringify(data.user));

        // 🔹 Kiểm tra vai trò: 1 = admin, còn lại là user
        const vaiTro = Number(data.user?.vai_tro);
        if (vaiTro === 1) {
          router.push('/Admin');
        } else {
          router.push('/User');
        }
      } else {
        alert('❌ ' + (data.message || `Lỗi (${res.status})`));
      }
    } catch (err) {
      console.error('[Login] fetch error', err);
      alert('❌ Lỗi hệ thống! Kiểm tra console và backend logs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Chưa có tài khoản?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push('/Register')}
          >
            Đăng ký ngay
          </span>
        </p>
        <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push('/forgot-password')}
          >
            Quên mật khẩu?
          </span>
      </div>
    </div>
  );
}
