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
});

// Thiết lập quan hệ giữa các bảng
LoaiXeModel.hasMany(PhuTungXeModel, { foreignKey: 'id_loai_xe' });
PhuTungXeModel.belongsTo(LoaiXeModel, { foreignKey: 'id_loai_xe' });
PhuTungXeModel.hasMany(BienTheSanPhamModel, { foreignKey: 'ma_san_pham' });
BienTheSanPhamModel.belongsTo(PhuTungXeModel, { foreignKey: 'ma_san_pham' });

// Xuất module để sử dụng
module.exports = {
  sequelize,
  LoaiXeModel,
  PhuTungXeModel,
  BienTheSanPhamModel,
  GioHangModel
};
