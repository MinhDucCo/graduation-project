export interface ILoai {
  id: number;
  ten_loai: string;
  thu_tu: number;
  an_hien: number; // 1: hiện, 0: ẩn
}

export interface ISanPham {
  id: number;
  ten_sp: string;
  gia: number;
  gia_km: number;
  ngay: string; // ISO date string (e.g., "2025-07-02")
  hinh: string; // tên file hình hoặc đường dẫn
  id_loai: number;
  luot_xem: number;
  hot: string; // có thể là "1"/"0" hoặc "true"/"false"
  an_hien: string; // nên đổi sang boolean nếu có thể
  tinh_chat: string; // mô tả tính chất: mới, cũ, đặc biệt...
}
