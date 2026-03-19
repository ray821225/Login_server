const QRToken = require("../models/QRToken");

// GET /api/qr/generate
exports.generate = async (req, res) => {
  try {
    const qrToken = await QRToken.generateToken();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const qrContent = `${baseUrl}/clock?token=${qrToken.token}`;

    res.json({
      success: true,
      token: qrToken.token,
      qrContent,
      expiresAt: qrToken.expiresAt,
      ttl: 60,
    });
  } catch (error) {
    res.status(500).json({
      message: "產生 QR Code 失敗",
      error: error.message,
    });
  }
};

// POST /api/qr/verify
exports.verify = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "缺少 token" });
    }

    const isValid = await QRToken.verifyToken(token);
    res.json({ success: true, valid: isValid });
  } catch (error) {
    res.status(500).json({
      message: "驗證失敗",
      error: error.message,
    });
  }
};

// GET /api/qr/status/:token
exports.getStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await QRToken.getStatus(token);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({
      message: "查詢失敗",
      error: error.message,
    });
  }
};
