
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-teal-600 to-blue-700 text-white relative overflow-hidden">
        {/* Background wave effect */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
                fill="#ffffff"
                d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <img
                  src="/image/logo1-removebg-preview.png"
                  alt="Logo"
                  className="w-50 h-16 object-contain transition-transform duration-300 hover:scale-105"
              />
              <p className="text-gray-100 text-sm leading-relaxed max-w-xs">
                Khám phá thế giới với những tour du lịch chất lượng cao và tin tức cập nhật từ BenThanhTourist.
              </p>
            </div>

            {/* Quick Links */}
            {/* <div>
              <h3 className="text-2xl font-semibold mb-6 text-yellow-300">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                      to="/news"
                      className="text-gray-100 hover:text-yellow-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link
                      to="/tours"
                      className="text-gray-100 hover:text-yellow-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Tour Du Lịch
                  </Link>
                </li>
                <li>
                  <Link
                    
                      className="text-gray-100 hover:text-yellow-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Về Chúng Tôi
                  </Link>
                </li>
                <li>
                  <Link
                      to="/contact"
                      className="text-gray-100 hover:text-yellow-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Liên Hệ
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-yellow-300">Thông Tin Liên Hệ</h3>
              <ul className="space-y-3 text-gray-100 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8c0 3.86 2.77 7.07 6.5 7.78v2.72a1 1 0 001.55.83l3-2a1 1 0 00.45-.83v-2.28A7.95 7.95 0 0018 10a8 8 0 00-8-8zm-1 12v-2H7v2h2zm2-2v2h2v-2h-2zm-2-4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
                  </svg>
                  123 Đường ABC, Quận XYZ, TP.HCM
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  (84) 123-456-789
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@newstravel.com
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-yellow-300">Theo Dõi Chúng Tôi</h3>
              <div className="flex space-x-6">
                <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-100 hover:text-yellow-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-100 hover:text-yellow-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-100 hover:text-yellow-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.148 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.668.227 1.981 1.911 1.826 5.295.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.195 3.384 1.879 5.071 5.263 5.226 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c3.384-.195 5.071-1.879 5.226-5.263.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.195-3.384-1.879-5.071-5.263-5.226C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-teal-400/30 mt-12 pt-8 text-center text-gray-100 text-sm">
            <p>© {new Date().getFullYear()} TRƯƠNG  QUANG  MINH</p>
          </div>
        </div>
      </footer>
  );
};
