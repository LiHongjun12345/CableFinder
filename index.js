
//创建一个 app.js 文件，用于定义 API 逻辑：
const express = require('express');
const bodyParser = require('body-parser');
// const { sql, poolPromise } = require('./db');
const { mysql, poolPromise } = require('./db');

const app = express();
// app.use(express.json());
const port = 22363;

// // 中间件
app.use(bodyParser.json());

// // 测试 API
app.get('/', (req, res) => {
    res.send('API is running!');
});

// // 获取数据的 API 示例
app.get('/api/data', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM QR_info');
        return res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Server error');
    }
});

app.get('/api/Checkdata', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT SN FROM QR_info');
        return res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Server error');
    }
});

app.get('/api/CableList', async (req, res) => {
    try {
        const pool = await poolPromise;
        const getresult0 = await pool.request().query('SELECT SN, CableUser0, CableUser1 FROM QR_info order by Timestamp desc');
        for (let row of getresult0.recordset) {
            if (!row.CableUser1 || row.CableUser1.trim() === '') {
                await pool.request().query(`
                    UPDATE QR_info
                    SET CableUser1 = '${row.CableUser0}'
                    WHERE SN = '${row.SN}'
                    `);
            }
        }
        const result = await pool.request().query(`SELECT SN, CableUser0, CableUser1 FROM QR_info`);
        return res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Server error');
    }
});

// // 插入数据的 API 示例
app.post('/api/data', async (req, res) => {
    
    const { OEM, Variant, Phase, Length, InOrEx, CableType, SN, CableUser0} = req.body; // 替换为你的表字段
    
    try {
        const pool = await poolPromise;
        await pool
            .request()
            .input('OEM', mysql.VarChar, OEM)
            .input('Variant', mysql.VarChar, Variant)
            .input('Phase', mysql.VarChar, Phase)
            .input('Length', mysql.VarChar, Length)
            .input('InOrEx', mysql.VarChar, InOrEx)
            .input('CableType', mysql.VarChar, CableType)
            .input('SN', mysql.VarChar, SN)
            .input('CableUser0', mysql.VarChar, CableUser0)
            .query('INSERT INTO QR_info (OEM, Variant, Phase, Length, InOrEx, CableType, SN, CableUser0) VALUES (@OEM, @Variant, @Phase, @Length, @InOrEx, @CableType, @SN, @CableUser0)');
        return res.send('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //样件登记
app.post('/api/sample', async (req, res) => {
    
    const { ProjectName, SampleName, StorageLocation, BOM, SN, Receiver, DeliveryDate, Comment} = req.body; // 替换为你的表字段
    
    try {
        const pool = await poolPromise;
        await pool
            .request()
            .input('ProjectName', mysql.VarChar, ProjectName)
            .input('SampleName', mysql.VarChar, SampleName)
            .input('StorageLocation', mysql.VarChar, StorageLocation)
            .input('BOM', mysql.VarChar, BOM)
            .input('SN', mysql.VarChar, SN)
            .input('Receiver', mysql.VarChar, Receiver)
            .input('DeliveryDate', mysql.VarChar, DeliveryDate)
            .input('Comment', mysql.VarChar, Comment)
            .query('INSERT INTO Sample_manage (ProjectName, SampleName, StorageLocation, BOM, SN, Receiver, DeliveryDate, Comment) VALUES (@ProjectName, @SampleName, @StorageLocation, @BOM, @SN, @Receiver, @DeliveryDate, @Comment)');
        return res.send('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error!');
    }
});

// //小程序获取线束列表
app.post('/api/CableList', async (req, res) => {    
    const { SN, CableUser, OEM } = req.body; 
    try {
        const pool = await poolPromise;
        await pool
            .request()
            .input('SN', mysql.VarChar, SN)
            .input('CableUser', mysql.VarChar, CableUser)
            .input('OEM', mysql.VarChar, OEM)
            .query('SELECT SN AS Cable_ID, CableUser0 AS User0, CableUser1 AS User1 FROM QR_info WHERE SN = @SN, CableUser0 = @CableUser, CableUser1 = @CableUser1');
            return res.json(result.recordset);
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //检查数据是否存在
app.post('/api/Checkdata', async (req, res) => {
    
    const { SN } = req.body; // 替换为你的表字段
    
    try {
        const pool = await poolPromise;
        const CheckResult = await pool
        .request()
        .input('SN', mysql.VarChar, SN).query('SELECT 1 FROM QR_info WHERE SN = @SN');
        console.log(CheckResult.recordset.length);
        console.log(CheckResult);
        console.log(SN);
        if(CheckResult.recordset.length > 0) {            
            return res.json({ exists: true}).status(200);
        }
        else 
        {      
            return res.json({ exists: false});
        }
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //pin定义显示
app.post('/api/PinDef', async (req, res) => {
    const TableNames = req.body.TableNames;
    // console.log(TableNames);
    try{
        const pool = await poolPromise;           
        let result = await pool.request().query(`SELECT * FROM ${TableNames}`);  //${TableNames}
        // results.push(result.recordset);
        return res.json(result.recordset);
    } catch(err) {
        console.error(err);
        return res.status(500).send('查询失败')
    }
});

// //展示当前线束使用者
app.post('/api/Users', async (req, res) => {
    
    const { SN } = req.body; // 替换为你的表字段
    // console.log(SN);
    try {
        const pool = await poolPromise;
        let result = await pool
        .request()
        .query(`SELECT CableUser0, CableUser1 FROM QR_info WHERE SN = '${ SN }'`);//, CableUser0 = @CableUser0, CableUser1 = @CableUser1`);
        console.log(result.recordset);         
        return res.json(result.recordset);
        
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //修改线束使用者
app.post('/api/newUser', async (req, res) => {
    
    const { SN, CableUser1 } = req.body; // 替换为你的表字段
    console.log(CableUser1);
    try {
        const pool = await poolPromise;
        let result = await pool
        .request()
        .query(`UPDATE QR_info SET CableUser1 = '${ CableUser1 }' WHERE SN = '${ SN }'`);//, CableUser0 = @CableUser0, CableUser1 = @CableUser1`);
        console.log(result.recordset);         
        return res.json(result.recordset);
        
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //获取样机的所有流转信息
app.post('/api/SampleTrace', async (req, res) => {    
    const { ProjectName, SN } = req.body; 
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .query(`SELECT * FROM Sample_manage WHERE ProjectName = '${ ProjectName }' and SN = '${ SN }' order by UpdateTime Desc`);
            const formatedResult = result.recordset.map(row => ({
                ...row,
                DeliveryDate: row.DeliveryDate.toISOString().split('T')[0]
            }));
            console.log(formatedResult);
            return res.json(formatedResult);
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});

// //扫码获取样机的最早录入信息
app.post('/api/scanCode', async (req, res) => {    
    const { SN } = req.body; 
    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .query(`SELECT TOP 1 * FROM Sample_manage WHERE  SN = '${ SN }' order by UpdateTime ASC`);
            const formatedResult = result.recordset.map(row => ({
                ...row,
                DeliveryDate: row.DeliveryDate.toISOString().split('T')[0]
            }));
            console.log(formatedResult);
            return res.json(formatedResult);
    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Server error');
    }
});


// // 启动服务器
app.listen(port, () => {
    console.log(`Server is running on https://sh-cynosdbmysql-grp-3uxh66gs.sql.tencentcdb.com:${port}`);
});

// 查询数据示例
poolPromise.query('SELECT * FROM qr_info', (err, results) => {
    if (err) {
      console.error('查询失败:', err);
      return;
    }
    console.log('查询结果:', results);
  });
  
  // 使用 Promise 风格（推荐）
  const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
      poolPromise.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };
  
  // 异步查询示例
  async function getData() {
    try {
      const data = await queryAsync('SELECT * FROM qr_info');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }
  
  getData();