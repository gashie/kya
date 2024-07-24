const dotenv = require("dotenv");
const mysql = require("mysql");
dotenv.config({ path: "../config/config.env" });

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

let monitdb = {};

monitdb.FindConfirmed = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customerghanacardupdate WHERE status = 'verified'";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};
  
monitdb.Update = (postdata, id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE customerghanacardupdate SET ? WHERE id = ?",
      [postdata, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

monitdb.FindCustomer = (email) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customer WHERE email = ?";
    pool.query(sql, [email], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
monitdb.ProcessFailure = (date,message,status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT  m.fullName,c.userAgentHash,c.customerHash,c.id,c.pin,c.selfie,c.frontpic,c.backpic,c.customerGhanaCardData  FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE (c.status = ?) AND c.updatedBy is null AND c.pin <> '' AND customerGhanaCardData  = ?  order by c.id DESC`;
    pool.query(sql, [status,message], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

monitdb.ProcessPendingFailure = (status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT  m.fullName,c.userAgentHash,c.customerHash,c.id,c.pin,c.selfie,c.frontpic,c.backpic,c.customerGhanaCardData  FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE (c.status = ?) AND c.updatedBy is null AND c.pin <> '' order by c.id DESC`;
    pool.query(sql, [status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

monitdb.OldProcessFailure = (date,message,status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM customerghanacardupdate WHERE createdAt >=  ? AND customerGhanaCardData  = ?  and status = ? and updatedBy is null and pin <> ''  order by id ASC limit 10`;
    pool.query(sql, [date,message,status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

monitdb.FetchAllVerified = () => {
  return new Promise((resolve, reject) => {
   
    const sql = `SELECT  m.fullName,m.customerAccount,m.customerID,m.customerCategory,m.email,m.phone,c.id,c.pin,c.customerGhanaCardData  FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE (c.status = "verified") 
    ORDER BY m.createdAt ASC`;
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};
module.exports = monitdb;
