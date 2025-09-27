import { ISanPham } from "@/app/components/cautrucdata";
import Show1SP from "@/app/components/ShowSP";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const tu_khoa = searchParams.tu_khoa || '';
  const page = Number(searchParams.page) || 1;
  const limit = 9;
  let sp_arr: ISanPham[] = [];
  let totalProducts = 0;
  let error: string | null = null;

  try {
    const resSP = await fetch(
      `http://localhost:3000/api/timkiem/${encodeURIComponent(tu_khoa)}/${page}`,
      { cache: 'no-store' }
    );

    if (!resSP.ok) {
      throw new Error(`API trả về lỗi: ${resSP.status} - ${resSP.statusText}`);
    }

    sp_arr = await resSP.json();

    const resTotal = await fetch(
      `http://localhost:3000/api/timkiem/${encodeURIComponent(tu_khoa)}/count`,
      { cache: 'no-store' }
    );
    if (resTotal.ok) {
      const totalData = await resTotal.json();
      totalProducts = totalData.total || sp_arr.length;
    } else {
      throw new Error(`API count trả về lỗi: ${resTotal.status}`);
    }
  } catch (err: any) {
    error = err.message || 'Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại!';
    console.error('SearchPage Error:', err);
  }
  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Kết quả tìm kiếm cho: "{tu_khoa || 'Tất cả'}"
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {sp_arr.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sp_arr.map((sp: ISanPham) => (
            <Show1SP key={sp.ma_san_pham} sp={sp} />
          ))}
        </div>
      ) : (
        <p className="text-center">Không tìm thấy sản phẩm nào cho từ khóa "{tu_khoa}".</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <a
              key={pageNum}
              href={`/tim-kiem?tu_khoa=${encodeURIComponent(tu_khoa)}&page=${pageNum}`}
              className={`px-4 py-2 border rounded ${
                pageNum === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
              }`}
            >
              {pageNum}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}