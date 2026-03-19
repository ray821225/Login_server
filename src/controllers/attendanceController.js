const Attendance = require("../models/Attendance");
const QRToken = require("../models/QRToken");
const User = require("../models/User");

// 取得今天日期字串 (YYYY-MM-DD)
const getTodayStr = () => {
  return new Date().toLocaleDateString("sv-SE");
};

// POST /api/attendance/clock
// 已登入使用者打卡
exports.clock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { method = "manual", qrToken } = req.body;

    // QR Code 驗證
    if (method === "qrcode") {
      if (!qrToken) {
        return res.status(400).json({ message: "缺少 QR Code 驗證碼" });
      }
      const isValid = await QRToken.verifyToken(qrToken);
      if (!isValid) {
        return res
          .status(400)
          .json({ message: "QR Code 已過期或無效，請重新掃描" });
      }
    }

    const clockUser = await User.findById(userId);

    const today = getTodayStr();
    let attendance = await Attendance.findOne({ user: userId, date: today });

    const username = clockUser?.username || "員工";

    if (!attendance) {
      // 上班打卡
      attendance = await Attendance.create({
        user: userId,
        date: today,
        clockIn: new Date(),
        clockInMethod: method,
        status: "clocked_in",
      });

      if (method === "qrcode" && qrToken) {
        await QRToken.markUsed(qrToken, username);
      }

      return res.status(201).json({
        success: true,
        message: "上班打卡成功",
        type: "clock_in",
        attendance,
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        message: "今天已完成簽到與簽退，無法重複打卡",
      });
    }

    // 下班打卡
    attendance.clockOut = new Date();
    attendance.clockOutMethod = method;
    attendance.status = "completed";
    await attendance.save();

    if (method === "qrcode" && qrToken) {
      await QRToken.markUsed(qrToken, username);
    }

    return res.json({
      success: true,
      message: "下班打卡成功",
      type: "clock_out",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "簽到記錄衝突，請稍後重試" });
    }
    res.status(500).json({
      message: "打卡失敗",
      error: error.message,
    });
  }
};

// POST /api/attendance/clock-by-credentials
// 公用裝置打卡（輸入信箱密碼）
exports.clockByCredentials = async (req, res) => {
  try {
    const { email, password, qrToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "請提供電子郵件和密碼" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "電子郵件或密碼錯誤" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "電子郵件或密碼錯誤" });
    }

    let method = "manual";
    if (qrToken) {
      const isValid = await QRToken.verifyToken(qrToken);
      if (!isValid) {
        return res.status(400).json({ message: "QR Code 已過期或無效" });
      }
      method = "qrcode";
    }

    const today = getTodayStr();
    let attendance = await Attendance.findOne({ user: user._id, date: today });

    if (!attendance) {
      attendance = await Attendance.create({
        user: user._id,
        date: today,
        clockIn: new Date(),
        clockInMethod: method,
        status: "clocked_in",
      });

      if (qrToken && method === "qrcode") {
        await QRToken.markUsed(qrToken, user.username);
      }

      return res.status(201).json({
        success: true,
        message: `${user.username} 上班打卡成功`,
        type: "clock_in",
        username: user.username,
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        message: "今天已完成簽到與簽退，無法重複打卡",
      });
    }

    attendance.clockOut = new Date();
    attendance.clockOutMethod = method;
    attendance.status = "completed";
    await attendance.save();

    if (qrToken && method === "qrcode") {
      await QRToken.markUsed(qrToken, user.username);
    }

    return res.json({
      success: true,
      message: `${user.username} 下班打卡成功`,
      type: "clock_out",
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({
      message: "打卡失敗",
      error: error.message,
    });
  }
};

// GET /api/attendance/today
exports.getToday = async (req, res) => {
  try {
    const today = getTodayStr();

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    res.json({
      success: true,
      attendance: attendance || null,
    });
  } catch (error) {
    res.status(500).json({
      message: "取得今日簽到狀態失敗",
      error: error.message,
    });
  }
};

// GET /api/attendance/history?page=1&limit=10
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find({ user: req.user.id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments({ user: req.user.id }),
    ]);

    res.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "取得簽到記錄失敗",
      error: error.message,
    });
  }
};
