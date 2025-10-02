import { Sequelize, DataTypes, Model } from "sequelize";
import mysql2 from 'mysql2'; // Needed to fix sequelize issues with WebPack
const sequelize = new Sequelize(
    { database: 'quan_ly_phu_tung',  username: 'root', password: '', 
    host:'localhost',  dialect:'mysql', dialectModule: mysql2, // fix sequelize with WebPack
})
interface iTinTuc extends Model {
  id: number;
  tieu_de: string;
  slug: string;
  mo_ta: string;
  ngay: Date;
  hinh: string;
  noi_dung: string;  
  luot_xem: number;
  id_loai: number;
}
export const TinTucModel = sequelize.define<iTinTuc>(
  "tin_tuc",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tieu_de: { type: DataTypes.STRING },
    mo_ta: { type: DataTypes.STRING },
    slug: { type: DataTypes.STRING },
    hinh: { type: DataTypes.STRING },
    ngay: { type: DataTypes.DATE },
    noi_dung: { type: DataTypes.TEXT },
    id_loai: { type: DataTypes.INTEGER },
    luot_xem: { type: DataTypes.INTEGER }, // sửa NUMBER -> INTEGER
  },
  { timestamps: false, tableName: "tin_tuc" }
);
