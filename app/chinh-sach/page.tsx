export default function GioiThieuPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-8">
          Chính sách công ty phụ tùng ô tô xe máy GearX Việt Nam
        </h1>

        {/* 1. Chính sách về lắp đặt và an toàn */}
        <section className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
          <header className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-700">
              1. Chính sách về lắp đặt và an toàn
            </h2>
          </header>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Tuân thủ pháp luật</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Không che khuất tầm nhìn.</li>
                <li>Không gây tiếng ồn vượt mức cho phép.</li>
                <li>Không làm thay đổi cấu trúc xe ảnh hưởng đến vận hành.</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">An toàn cho người dùng</h3>
              <p className="text-sm">
                Phụ kiện phải đảm bảo an toàn trong quá trình sử dụng, không gây nguy hiểm cho người điều khiển và người tham gia giao thông.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Chất lượng sản phẩm</h3>
              <p className="text-sm">
                Ưu tiên sản phẩm có nguồn gốc rõ ràng, chất lượng tốt, đảm bảo độ bền và an toàn khi lắp đặt.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Chính sách bảo hành và đổi trả */}
        <section className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
          <header className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-700">
              2. Chính sách bảo hành và đổi trả
            </h2>
          </header>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Bảo hành</h3>
              <p className="text-sm">Chính sách bảo hành rõ ràng: thời gian, phạm vi, và các trường hợp không áp dụng.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Đổi trả</h3>
              <p className="text-sm">Quy định rõ về điều kiện, thời gian và giấy tờ cần thiết khi đổi trả (ví dụ: hóa đơn).</p>
            </div>
          </div>
        </section>

        {/* 3. Chính sách nhập khẩu */}
        <section className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
          <header className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-700">
              3. Chính sách nhập khẩu
            </h2>
          </header>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Giấy tờ nhập khẩu</h3>
              <p className="text-sm">Tuân thủ đầy đủ các thủ tục: đăng ký kiểm tra chất lượng, tờ khai hải quan, hóa đơn, vận đơn.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Yêu cầu về chất lượng</h3>
              <p className="text-sm">Sản phẩm nhập khẩu phải đáp ứng tiêu chuẩn chất lượng của cơ quan có thẩm quyền.</p>
            </div>
          </div>
        </section>

        {/* 4. Các loại đồ chơi xe */}
        <section className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
          <header className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m4 0h1v4h1m-6-8h.01M12 12h.01M12 20h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-700">
              4. Các loại đồ chơi xe
            </h2>
          </header>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Đồ chơi xe máy</h3>
              <p className="text-sm">
                Bọc yên, đèn, giảm xóc, mâm xe, tay ga, đèn LED, móc khóa, sạc điện thoại…
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Đồ chơi xe hơi</h3>
              <p className="text-sm">
                Màn hình giải trí, camera hành trình, cảm biến áp suất lốp, thảm sàn, bọc vô-lăng…
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
