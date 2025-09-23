const express = require("express");
const helmet = require("helmet");
const app = express();
const port = 3000;
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "http://localhost:3000"],
    imgSrc: ["'self'", "data:", "https://example.com"], // Cho phép tải ảnh từ URL
  },
}));
app.use(express.static('public')); // Phục vụ file tĩnh từ thư mục public
const { sequelize, LoaiXeModel, PhuTungXeModel } = require("./database");
const { Op } = require("sequelize");

app.get("/", (req, res) => {
  res.send(`
    <h1>API Phụ tùng xe</h1>
    <p>Truy cập các API:</p>
    <ul>
      <li><a href="/api/loai_xe/1">/api/loai_xe/1</a> - Lấy thông tin loại xe</li>
      <li><a href="/api/phu_tung_xe">/api/phu_tung_xe</a> - Lấy danh sách phụ tùng xe</li>
      <li><a href="/api/phu_tung/PT001">/api/phu_tung/PT001</a> - Xem chi tiết sản phẩm</li>
    </ul>
  `);
});

app.get("/api/loai_xe/:id", async (req, res) => {
  try {
    const loai = await LoaiXeModel.findByPk(req.params.id);
    if (loai) {
      res.json(loai);
    } else {
      res.status(404).json({ message: "Không tìm thấy loại xe" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/phu_tung_xe", async (req, res) => {
  try {
    const sp_arr = await PhuTungXeModel.findAll({
      where: {
        an_hien: 1
      },
      order: [['gia', 'ASC']],
      include: [{ model: LoaiXeModel, attributes: ['ten_loai'] }],
    });
    res.json(sp_arr);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/phu_tung/:ma_san_pham", async (req, res) => {
  try {
    const san_pham = await PhuTungXeModel.findOne({
      where: { ma_san_pham: req.params.ma_san_pham },
      include: [{ model: LoaiXeModel, attributes: ['ten_loai'] }],
    });
    if (san_pham) {
      res.json(san_pham);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});