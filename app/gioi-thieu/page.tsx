"use client";

export default function GioiThieuPage() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Tiêu đề */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-600 mb-8">
        Lịch sử hình thành & phát triển
      </h1>

      <p className="text-center font-bold text-gray-600 mb-6">
        Thương hiệu phụ tùng xe máy & ô tô chính hãng hàng đầu Việt Nam
      </p>

      <p className="text-gray-700 leading-relaxed mb-8 text-justify">
        Thành lập năm 2014, <strong>greaX</strong> khởi đầu với niềm đam mê phụ
        tùng xe và sứ mệnh mang đến giải pháp bền bỉ cho mọi phương tiện Việt
        Nam. Trải qua hơn 10 năm, greaX đã mở rộng thành hệ thống phân phối toàn
        quốc, hợp tác với hàng trăm gara và đại lý lớn nhỏ.
      </p>

      {/* Tầm nhìn & sứ mệnh */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Tầm nhìn & Sứ mệnh
      </h2>
      <p className="text-gray-700 mb-8 leading-relaxed">
        <strong>Tầm nhìn:</strong> Dẫn đầu trong lĩnh vực phụ tùng ô tô – xe máy
        tại Việt Nam.
        <br />
        <strong>Sứ mệnh:</strong> Cung cấp sản phẩm chất lượng cao, giá cạnh
        tranh, phục vụ tận tâm, giúp khách hàng an tâm trên mọi cung đường.
      </p>

      {/* Giá trị cốt lõi */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Giá trị cốt lõi
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {[
          {
            title: "Chất lượng",
            desc: "100% hàng chính hãng, kiểm định kỹ càng.",
          },
          { title: "Uy tín", desc: "Đặt niềm tin khách hàng lên hàng đầu." },
          {
            title: "Đổi mới",
            desc: "Liên tục cập nhật công nghệ và sản phẩm mới.",
          },
          {
            title: "Tận tâm",
            desc: "Đội ngũ kỹ thuật và tư vấn viên chuyên nghiệp.",
          },
        ].map((value, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {value.title}
            </h3>
            <p className="text-gray-600">{value.desc}</p>
          </div>
        ))}
      </div>

      {/* Sản phẩm nổi bật */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Sản phẩm nổi bật
      </h2>
      <ul className="list-disc list-inside text-gray-700 mb-8 space-y-2">
        <li>Phụ tùng động cơ: bugi, lọc nhớt, dây curoa, bạc đạn, piston...</li>
        <li>Phụ tùng gầm: thắng đĩa, phuộc, nhông sên đĩa, lốp xe...</li>
        <li>Phụ kiện điện: Ắc quy, đèn pha, cảm biến, còi điện...</li>
        <li>Dầu nhớt & dung dịch: Castrol, Motul, Shell, Total...</li>
      </ul>

      {/* Cam kết dịch vụ */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Cam kết dịch vụ
      </h2>
      <ul className="space-y-2 text-gray-700 mb-10">
        <li>✔ 100% hàng chính hãng có nguồn gốc rõ ràng.</li>
        <li>✔ Chính sách đổi trả trong 7 ngày nếu lỗi kỹ thuật.</li>
        <li>✔ Giao hàng toàn quốc, bảo hành dài hạn.</li>
        <li>✔ Hỗ trợ kỹ thuật 24/7 cho gara và khách hàng cá nhân.</li>
      </ul>

      {/* Thông tin liên hệ */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Thông tin liên hệ
      </h2>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-700">
          📞 Hotline: <strong>1900 123 456</strong>
          <br />
          📧 Email: <strong>gearX@gmail.com</strong>
          <br />
          🏢 Trụ sở: 123 Nguyễn Văn Linh, Q.7, TP.HCM
          <br />
          🌐 Website: <strong>www.gearX.click</strong>
        </p>
      </div>
    </section>
  );
}
