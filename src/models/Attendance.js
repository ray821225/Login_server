const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "需要使用者 ID"],
    },
    date: {
      type: String, // 格式 'YYYY-MM-DD'
      required: true,
    },
    clockIn: {
      type: Date,
      default: null,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    clockInMethod: {
      type: String,
      enum: ["qrcode", "manual"],
      default: null,
    },
    clockOutMethod: {
      type: String,
      enum: ["qrcode", "manual"],
      default: null,
    },
    status: {
      type: String,
      enum: ["clocked_in", "completed"],
      default: "clocked_in",
    },
  },
  { timestamps: true }
);

// 同一使用者同一天只有一筆記錄
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
