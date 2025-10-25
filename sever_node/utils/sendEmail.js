const nodemailer = require("nodemailer");
async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sxodia247@gmail.com", // đổi Gmail thật của bạn
      pass: "kjrr hasw pafk pzjr", // App password của Gmail
    },
  });

  const mailOptions = {
    from: "youremail@gmail.com",
    to: email,
    subject: "Xác nhận tài khoản",
    html: `<p>Nhấn vào <a href="http://localhost:3000/api/auth/verify?token=${token}">đây</a> để xác nhận tài khoản.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };



//mk ưng dụng kjrr hasw pafk pzjr