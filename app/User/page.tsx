'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";


interface IUser {
  id: number;
  email: string;
  ho_ten: string;
  dia_chi?: string;
  dien_thoai?: string;
  vai_tro?: string;
}

export default function NguoiDungPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ho_ten: '',
    dia_chi: '',
    dien_thoai: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('Bạn chưa đăng nhập!');
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // ĐẢM BẢO formData lấy đúng giá trị (kể cả khi reload)
    setFormData({
      ho_ten: parsedUser.ho_ten || '',
      dia_chi: parsedUser.dia_chi || '',
      dien_thoai: parsedUser.dien_thoai || '',
    });

    setLoading(false);
  }, [router]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user?.id) return;

  try {
    const res = await fetch('http://localhost:3000/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        ho_ten: formData.ho_ten,
        dia_chi: formData.dia_chi,
        dien_thoai: formData.dien_thoai,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setFormData({
        ho_ten: data.user.ho_ten || '',
        dia_chi: data.user.dia_chi || '',
        dien_thoai: data.user.dien_thoai || '',
      });

      setIsEditing(false);

      // 🔥 Toast thành công
      toast.success("Cập nhật thành công!");

      // Event cập nhật UI header
      window.dispatchEvent(new Event("userUpdated"));
    } else {
      toast.error(data.message || "Cập nhật thất bại");
    }
  } catch (err) {
    console.error(err);
    toast.error("Lỗi kết nối server");
  }
};
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Đang tải...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-800 flex items-center gap-2">
            Thông tin tài khoản
          </h1>

        </div>
        {/* Form chỉnh sửa hoặc hiển thị */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ tên
              </label>
              <input
                type="text"
                value={formData.ho_ten}
                onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
                placeholder="Tên người nhận"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Điện thoại
              </label>
              <input
                type="text"
                value={formData.dien_thoai}
                onChange={(e) => setFormData({ ...formData, dien_thoai: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="84+"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                value={formData.dia_chi}
                onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Địa Chỉ giao hàng"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
              >

                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Thông tin người dùng */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.ho_ten.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-lg">
                    <strong className="text-gray-700">Họ tên:</strong>{' '}
                    <span className="font-medium">{user.ho_ten || 'Chưa có'}</span>
                  </p>
                  <p className="text-lg">
                    <strong className="text-gray-700">Email:</strong>{' '}
                    <span className="font-medium">{user.email}</span>
                  </p>
                  <p className="text-lg">
                    <strong className="text-gray-700">Điện thoại:</strong>{' '}
                    <span className="font-medium">{user.dien_thoai || 'Chưa có'}</span>
                  </p>
                  <p className="text-lg">
                    <strong className="text-gray-700">Địa chỉ:</strong>{' '}
                    <span className="font-medium">{user.dia_chi || 'Chưa có'}</span>
                  </p>
                  <p className="text-lg">
                    <strong className="text-gray-700">Vai trò:</strong>{' '}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.vai_tro === '1'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {user.vai_tro === '1' ? 'Admin' : 'Người dùng'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
              >
                Chỉnh sửa thông tin
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  window.dispatchEvent(new Event("userUpdated"));
                  router.push("/");
                }}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
              >
                Đăng xuất
              </button>

              <button
                onClick={() => router.push("/don-hang-cua-toi")}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all">
                Đơn hàng của tôi
              </button>
            </div>


          </>
        )}
      </div>
    </div>
  );
}