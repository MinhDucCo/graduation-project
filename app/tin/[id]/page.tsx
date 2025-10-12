// app/tin/[id]/page.tsx

import { redirect } from 'next/navigation';
import { TinTucModel } from '@/database';

export default async function ChiTiet1Tin({ params }: { params: { id: string } }) {
  const id = params.id;

  const tin = await TinTucModel.findByPk(id);
  if (tin === null) redirect("/");

  return (
    <div className="max-w-[80%] mx-auto leading-8 text-justify my-6">
      <h1 className="text-[1.5em] bg-sky-500 text-white p-3 rounded shadow text-center">
        {tin.tieu_de}
      </h1>

      {/* ảnh đại diện */}
      {tin.hinh && (
        <img
          src={tin.hinh}
          alt={tin.tieu_de}
          className="w-full max-h-[400px] object-cover rounded my-4 shadow"
        />
      )}
      <h3 className="text-[1.2em] leading-10 text-gray-800">{tin.mo_ta}</h3>
      <hr className="my-3 border-gray-300" />
      <p className="italic text-right my-4 text-sm text-gray-600">
        Cập nhật: {new Date(tin.ngay).toLocaleDateString("vi")}.<br />
        Lượt xem: {tin.luot_xem}
      </p>
      <div
  className="prose max-w-none text-lg leading-relaxed text-gray-800"
  dangerouslySetInnerHTML={{ __html: tin.noi_dung }}
/>
    </div>
  );
}
