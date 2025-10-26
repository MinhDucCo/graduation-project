const nodemailer = require("nodemailer");

async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sxodia247@gmail.com", // Gmail thật của bạn
      pass: "kjrr hasw pafk pzjr", // App password của Gmail
    },
  });

  // 👇 Link xác nhận (sửa lại thành trang web home của bạn nếu cần)
  const verifyUrl = `http://localhost:3000/home?token=${token}`;

  const mailOptions = {
    from: '"GreaX Support" <sxodia247@gmail.com>',
    to: email,
    subject: "Xác nhận tài khoản GreaX",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f6f6;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #ff00a2ff; color: white; padding: 15px; text-align: center; font-size: 20px;">
            Xác nhận tài khoản GreaX
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <b>GreaX</b>.</p>
            <p>Vui lòng nhấn nút bên dưới để xác nhận tài khoản của bạn:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${verifyUrl}" style="background-color: #e1001eff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Xác nhận ngay
              </a>
            </div>
            <p>Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">&copy; 2025 GreaX. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
