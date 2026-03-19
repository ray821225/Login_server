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
  status: {
    type: String,
    enum: ["pending", "used"],
    default: "pending",
  },
  usedBy: {
    type: String,
    default: null,
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
  if (qrToken.status === "used") return false;
  return true;
};

// 標記 Token 為已使用
qrTokenSchema.statics.markUsed = async function (token, username) {
  await this.updateOne({ token }, { status: "used", usedBy: username });
};

// 查詢 Token 狀態
qrTokenSchema.statics.getStatus = async function (token) {
  const qrToken = await this.findOne({ token });
  if (!qrToken) return { exists: false };
  if (new Date() > qrToken.expiresAt) return { exists: false };
  return { exists: true, status: qrToken.status, usedBy: qrToken.usedBy };
};

module.exports = mongoose.model("QRToken", qrTokenSchema);
