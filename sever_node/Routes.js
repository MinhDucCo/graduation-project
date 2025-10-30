const express = require("express");
const router = express.Router();
 // hoặc đường dẫn đến nơi bạn khai báo Sequelize
const { QueryTypes } = require("sequelize");

// API thêm liên hệ
router.post("/api/lien_he", async (req, res) => {
  try {
    const { ho_ten, email, so_dien_thoai, noi_dung } = req.body;

    if (!ho_ten || !email || !noi_dung) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    await sequelize.query(
      `INSERT INTO lien_he (ho_ten, email, so_dien_thoai, noi_dung, trang_thai)
       VALUES (?, ?, ?, ?, 'chưa xử lý')`,
      {
        replacements: [ho_ten, email, so_dien_thoai, noi_dung],
        type: QueryTypes.INSERT,
      }
    );

    res.json({ message: "Gửi liên hệ thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lưu liên hệ." });
  }
});

module.exports = router;
