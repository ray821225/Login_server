const mongoose = require("mongoose");
const crypto = require("crypto");

const qrTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // TTL: 120 秒後自動刪除
  },
});

// 產生新的 QR Token
qrTokenSchema.statics.generateToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 1000); // 60 秒後過期

  const qrToken = await this.create({ token, expiresAt });
  return qrToken;
};

// 驗證 Token 是否有效
qrTokenSchema.statics.verifyToken = async function (token) {
  const qrToken = await this.findOne({ token });
  if (!qrToken) return false;
  if (new Date() > qrToken.expiresAt) {
    await qrToken.deleteOne();
    return false;
  }
  return true;
};

module.exports = mongoose.model("QRToken", qrTokenSchema);
