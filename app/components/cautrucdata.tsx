// cautrucdata.tsx
export interface ILoai {
  id: number;
  ten_loai: string;
  thu_tu: number;
  an_hien: number;
}

export interface ISanPham {
  ma_san_pham: number;   // mã sản phẩm (id)
  ten_san_pham: string;  // tên sản phẩm
  gia: number;           // giá
  so_luong: number;      // số lượng
  mau_sac: string;       // màu sắc
  mo_ta: string;         // mô tả
  hinh: string;          // hình ảnh
  id_loai_xe: number;    // id loại xe
  an_hien: number;       // ẩn hiện
}
