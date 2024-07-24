const pool = require("../config/db");

let cupdate = {};

cupdate.SaveAccount = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO customer SET ?", [postData], (err, results) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
};

cupdate.SaveHistory = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO event_history SET ?", [postData], (err, results) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
};



cupdate.SaveGhanaCard = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO customerghanacardupdate SET ?", [postData], (err, results) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
};

cupdate.FindGhanaCardCustomer = (customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customerghanacardupdate WHERE customerHash = ? AND  status = ?";
    pool.query(sql, [customerHash,'pending'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.FindGhanaCardCustomerAndProcess = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customerghanacardupdate WHERE id = ? AND  status = ?";
    pool.query(sql, [id,'pending'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.FindCardByID = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customerghanacardupdate WHERE id = ? AND  status = 'pending'";
    pool.query(sql, [id], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};


cupdate.GetCustomers = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customer";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

cupdate.FindGhCard = (pin,customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM customerghanacardupdate WHERE pin = ? AND customerHash = ? AND (status = "verified" OR status = "processed")`;
    pool.query(sql, [pin,customerHash], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.FindHash = (customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customer WHERE customerHash = ?";
    pool.query(sql, [customerHash], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.Completed = (account) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT m.customerAccount FROM customer m INNER JOIN customerghanacardupdate c ON c.email = m.email WHERE m.customerAccount = ? AND (c.status != "processed" AND c.status != "verified" AND c.status != "pending" AND c.status != "declined" AND c.status != "hold");`
    pool.query(sql, [account], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.FindCustomer = (customerHash) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customer WHERE customerHash = ?";
      pool.query(sql, [customerHash], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  cupdate.Single = (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customerghanacardupdate WHERE email = ? AND  status = 'pending'";
      pool.query(sql, [email], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  cupdate.All = (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customerghanacardupdate status = 'pending'";
      pool.query(sql, [email], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };

  cupdate.FindHasPending = (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customerghanacardupdate status = 'pending'";
      pool.query(sql, [email], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };
  cupdate.FindCustomerAccount = (account) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM customer WHERE customerAccount = ?";
      pool.query(sql, [account], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  cupdate.FindCustomerID = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT m.customerAccount FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE m.customerID = ? AND (c.status = "verified" OR c.status = "processed")`;
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  cupdate.FindCustomerIDPendingDeclined = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT m.customerAccount,c.id FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE m.customerID = ? AND (c.status = "pending" OR c.status = "declined")`;
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  
  

  cupdate.VerifyOtp = (otp,customerAccount) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM customer WHERE otp = ? AND customerAccount = ? AND status="new" AND NOW() <= DATE_ADD(createdAt, INTERVAL 3 MINUTE)`;
      pool.query(sql, [otp,customerAccount], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };
  
cupdate.UpdateAccount = (postdata, id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE customer SET ? WHERE id = ?",
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

cupdate.ViewVerified = (customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM customerghanacardupdate WHERE customerHash = ? AND  status = ?";
    pool.query(sql, [customerHash,'verified'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.ViewFailed = (customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM event_history WHERE customerHash = ?";
    pool.query(sql, [customerHash], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.ViewAllFailed = (customerHash,limit) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM event_history where customerHash = ? ORDER BY id DESC LIMIT ?";
    pool.query(sql,[customerHash,limit], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.Utility = (name,status) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS ? FROM customerupdate.customerghanacardupdate WHERE  status = ?";
    pool.query(sql,[name,status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.GraUtility = (name,status) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS ? FROM customerghanacardupdate WHERE  graStatus = ?";
    pool.query(sql,[name,status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.UtilityApphiveProcessed = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS total FROM customerupdate.customerghanacardupdate WHERE  status = ? AND updatedBy IS NOT NULL";
    pool.query(sql,['processed'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.UtilityAllCustomers = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS total FROM customer WHERE  status = ?";
    pool.query(sql,['confirmed'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};


cupdate.UtilitySystemProcessed = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS total FROM customerupdate.customerghanacardupdate WHERE  status = ? AND updatedBy IS NULL";
    pool.query(sql,['processed'], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.UpdateProcess = (postdata, id) => {
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

//new get customer
cupdate.GetNewPendingCustomers = (start,end,limit) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT m.id as custid ,m.customerHash, m.fullName,m.customerAccount,m.customerID,m.customerCategory,m.email,m.phone,m.customerData,m.status,m.createdAt,c.id,c.pin,c.selfie,c.frontpic,c.backpic,c.customerGhanaCardData AS ghCardInfo FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE c.createdAt >= ?  AND  c.createdAt < ? AND (c.status = "pending") 
    ORDER BY c.createdAt ASC LIMIT ?`;
    const sqlNoLimt = `SELECT m.id as custid ,m.customerHash, m.fullName,m.customerAccount,m.customerID,m.customerCategory,m.email,m.phone,m.customerData,m.status,m.createdAt,c.id,c.pin,c.selfie,c.frontpic,c.backpic,c.customerGhanaCardData AS ghCardInfo FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE c.createdAt >= ?  AND  c.createdAt < ? AND (c.status = "pending") 
    ORDER BY c.createdAt ASC`;
    pool.query(limit ?sql:sqlNoLimt,[start,end,limit], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

cupdate.FetchAllVerified = () => {
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


//new get pending from ghcard table
cupdate.FindPendingGhanaCardCustomer = (customerHash) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT c.id,c.pin,c.selfie,c.frontpic,c.backpic,c.customerGhanaCardData AS ghCardInfo FROM customer m INNER JOIN customerghanacardupdate c ON c.customerID = m.customerID WHERE c.customerHash = ? AND (c.status = "pending")`;
    pool.query(sql, [customerHash], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

cupdate.ProcessFailure = (date,message,status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM customerupdate.customerghanacardupdate WHERE createdAt >=  ? AND customerGhanaCardData  = ?  and status = ? and updatedBy is null and pin <> ''  order by id ASC;`;
    pool.query(sql, [date,message,status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};
module.exports = cupdate;
