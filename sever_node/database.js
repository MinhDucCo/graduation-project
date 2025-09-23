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
  gia: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  so_luong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mau_sac: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mo_ta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hinh: {
    type: DataTypes.STRING(255),
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

// Thiết lập quan hệ giữa hai bảng
LoaiXeModel.hasMany(PhuTungXeModel, { foreignKey: 'id_loai_xe' });
PhuTungXeModel.belongsTo(LoaiXeModel, { foreignKey: 'id_loai_xe' });

// Xuất module để sử dụng
module.exports = {
  sequelize,
  LoaiXeModel,
  PhuTungXeModel
};