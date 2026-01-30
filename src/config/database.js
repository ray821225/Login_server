const mongoose = require('mongoose');

const connectDB = async () => {
  // 如果沒有設定 MONGODB_URI，跳過資料庫連接
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  警告: 未設定 MONGODB_URI，資料庫功能將無法使用');
    console.warn('   請在 .env 文件中設定 MONGODB_URI 以啟用資料庫');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB 已連接: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ 資料庫連接錯誤: ${error.message}`);
    console.warn('⚠️  伺服器將繼續運行，但資料庫功能將無法使用');
  }
};

module.exports = connectDB;
