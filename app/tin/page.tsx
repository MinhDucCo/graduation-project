// app/tin/page.tsx
import Link from "next/link";
import { TinTucModel } from "@/database";

export default async function ListSP() {
  const tin_arr = await TinTucModel.findAll({
    where: { an_hien: 1 },
    order: [['ngay', 'DESC'], ['luot_xem', 'ASC']],
    offset: 0,
    limit: 10,
  });

  return (
    <div className="max-w-6xl mx-auto my-6 px-4">
      <h2 className="text-[1.4em] bg-sky-500 text-white p-3 uppercase rounded-lg shadow-md">
        📰 Danh sách bài viết
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {tin_arr.map((tin) => (
          <div
            key={tin.id}
            className="border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 bg-white flex flex-col"
          >
            {/* Nếu trong DB có cột hình ảnh thì hiển thị ở đây */}
            {/* {tin.hinh && (
              <img
                src={tin.hinh}
                alt={tin.tieu_de}
                className="w-full h-48 object-cover"
              />
            )} */}

            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sky-700 font-bold text-[1.1em] mb-2 line-clamp-2 hover:underline">
                <Link href={`/tin/${tin.id}`}>{tin.tieu_de}</Link>
              </h3>
              <p className="text-gray-600 text-sm flex-1 line-clamp-3">
                {tin.mo_ta}
              </p>

              <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                <span>📅 {new Date(tin.ngay).toLocaleDateString("vi-VN")}</span>
                <span>👁 {tin.luot_xem} lượt xem</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
