
import Link from "next/link";
export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="../image/logo1.png" alt="" className="h-12 w-auto" />
          <div className="text-sm text-gray-600 italic"></div>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-15 font-medium text-gray-700 uppercase text-sm">
          <Link href="/">TRANG CHỦ</Link>
          <Link href="/du-lich">DU LỊCH</Link>
          <Link href="/tin-tuc">TIN TỨC</Link>
          <Link href="/gioi-thieu">GIỚI THIỆU</Link>
          <Link href="/lien-he">LIÊN HỆ</Link>
        </nav>

        {/* Buttons */}
        <div className="flex space-x-4">
          <Link
            href="/dang-nhap"
            className="px-4 py-2 border border-teal-500 text-teal-600 rounded hover:bg-teal-50 transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/dang-ky"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}
