//const sql = require("mssql")
const mysql = require("mysql")
// 数据库配置
const config = {
  user: "ZeroX_manage",//"LiHongjun1",
  password: "ZeroX2025",//"lhj123456",
  host: "sh-cynosdbmysql-grp-3uxh66gs.sql.tencentcdb.com",
  database: "wechat_qrinfo",//"WechatDatabase",
  port: "22363",
  connectionLimit: "30"
  // options:{
  //   encrypt: true, //启动加密
  //   trustServerCertificate: true, //信任自签名证书
  // }
}

// 创建连接池
// const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log('Connected to SQL Server');
//         return pool;
//     })
//     .catch(err => {
//         console.error('Database Connection Failed:', err);
//         throw err;
//     });

// module.exports = { sql, poolPromise };

const poolPromise = mysql.createPool(config);

// 测试连接是否成功
poolPromise.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL 连接失败:', err);
    throw err;
  }
  console.log('成功连接到 MySQL 数据库');
  connection.release(); // 释放连接回池
});

module.exports = { mysql, poolPromise };
