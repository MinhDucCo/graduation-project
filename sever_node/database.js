// database.js
const { Sequelize, DataTypes } = require('sequelize');
// Tạo đối tượng kết nối đến database
const sequelize = new Sequelize('quan_ly_phu_tung', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// Model mô tả bảng loai_xe
const LoaiXeModel = sequelize.define('loai_xe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ten_loai: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thu_tu: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  an_hien: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: false,
  tableName: 'loai_xe'
});

// Model mô tả bảng phu_tung_xe
const PhuTungXeModel = sequelize.define('phu_tung_xe', {
  ma_san_pham: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  ten_san_pham: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_loai_xe: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loai_xe',
      key: 'id'
    }
  },
  mo_ta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  an_hien: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  timestamps: false,
  tableName: 'phu_tung_xe'
});

// Model mô tả bảng bien_the_san_pham
const BienTheSanPhamModel = sequelize.define('bien_the_san_pham', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ma_san_pham: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'phu_tung_xe',
      key: 'ma_san_pham'
    }
  },
  mau_sac: DataTypes.STRING(50),
  gia: DataTypes.DECIMAL(10, 2),
  so_luong: DataTypes.INTEGER,
  hinh: DataTypes.STRING(255),
  hinh_phu1: DataTypes.STRING,
  hinh_phu2: DataTypes.STRING,
  hinh_phu3: DataTypes.STRING
}, {
  timestamps: false,
  tableName: 'bien_the_san_pham'
});

// 🛒 Model mô tả bảng gio_hang
const GioHangModel = sequelize.define("gio_hang", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ten_san_pham: { type: DataTypes.STRING, allowNull: false },
  gia: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  id_user: { type: DataTypes.INTEGER, allowNull: false },
  id_san_pham: { type: DataTypes.INTEGER, allowNull: false },
  so_luong: { type: DataTypes.INTEGER, allowNull: false },
  hinh: { type: DataTypes.STRING, allowNull: true },
  mau_sac: { type: DataTypes.STRING, allowNull: true },
  ngay_them: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  freezeTableName: true, // ✅ giữ nguyên tên bảng 'gio_hang'
  timestamps: false       // bỏ cột createdAt/updatedAt nếu không cần
});

// 💬 Model mô tả bảng lien_he
const LienHeModel = sequelize.define("lien_he", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ho_ten: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  noi_dung: { type: DataTypes.TEXT, allowNull: false },
  so_dien_thoai: { type: DataTypes.STRING, allowNull: false },
  trang_thai: {
    type: DataTypes.ENUM("chưa xử lý", "đã xử lý"),
    defaultValue: "chưa xử lý",
  },

  ngay_gui: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  freezeTableName: true, // ✅ giữ nguyên tên bảng 'lien_he'
  timestamps: false      // ❌ không thêm createdAt / updatedAt
});
const Users = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  mat_khau: { type: DataTypes.STRING, allowNull: true },
  ho_ten: { type: DataTypes.STRING },
  dia_chi: { type: DataTypes.STRING },
  dien_thoai: { type: DataTypes.STRING },
  vai_tro: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 = user, 1 = admin
  khoa: { type: DataTypes.BOOLEAN, defaultValue: false },
  hinh: { type: DataTypes.STRING },
  email_verified_at: { type: DataTypes.DATE },
  remember_token: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "users",
  timestamps: false,
});

// models/don_hang.js
const DonHangModel = sequelize.define("don_hang", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ngay_dat: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  
  // ho_ten: { type: DataTypes.STRING(100), allowNull: false },

  ten_nguoi_nhan: { type: DataTypes.STRING(100), allowNull: false }, // GIỮ LẠI
  dia_chi: { type: DataTypes.STRING(255), allowNull: false },
  dien_thoai: { type: DataTypes.STRING(20), allowNull: false },
  ghi_chu: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(50), defaultValue: "Chờ xác nhận" },
  phuong_thuc: { type: DataTypes.STRING(20), defaultValue: "cod" },
  id_user: { type: DataTypes.INTEGER, allowNull: true, references: { model: "users", key: "id" } },
}, {
  timestamps: false,
  tableName: "don_hang",
});
const ChiTietDonHangModel = sequelize.define("don_hang_chi_tiet", {
  id_chi_tiet: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_don_hang: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "don_hang", key: "id" },
    onDelete: "CASCADE",
  },
  id_san_pham: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "phu_tung_xe", key: "ma_san_pham" }, // DÙNG ma_san_pham
    onDelete: "CASCADE",
  },
  so_luong: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  gia: { type: DataTypes.DECIMAL(10, 0), allowNull: true },
  danh_gia: { type: DataTypes.TEXT, allowNull: true },
  sao: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: false,
  tableName: "don_hang_chi_tiet",
});


// Thiết lập quan hệ giữa các bảng
LoaiXeModel.hasMany(PhuTungXeModel, { foreignKey: 'id_loai_xe' });
PhuTungXeModel.belongsTo(LoaiXeModel, { foreignKey: 'id_loai_xe' });
PhuTungXeModel.hasMany(BienTheSanPhamModel, { foreignKey: 'ma_san_pham' });
BienTheSanPhamModel.belongsTo(PhuTungXeModel, { foreignKey: 'ma_san_pham' });
DonHangModel.hasMany(ChiTietDonHangModel, { foreignKey: "id_don_hang", onDelete: "CASCADE" });
ChiTietDonHangModel.belongsTo(DonHangModel, { foreignKey: "id_don_hang" });



// Xuất module để sử dụng
console.log('Exporting Users:', Users);
module.exports = {
  sequelize,
  Users,
  LoaiXeModel,
  PhuTungXeModel,
  BienTheSanPhamModel,
  GioHangModel,
  LienHeModel,
  DonHangModel,
  ChiTietDonHangModel
};
