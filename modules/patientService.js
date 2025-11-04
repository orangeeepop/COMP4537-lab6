const utils = require("./utils");

function createTable(db) {
  return new Promise((resolve, reject) => {
    db.query("CREATE DATABASE IF NOT EXISTS labDB;", (err) => {
      if (err) {
        console.error("❌ Failed to create database:", err);
        return reject(err);
      }

      db.query("USE labDB;", (err2) => {
        if (err2) {
          console.error("❌ Failed to select database:", err2);
          return reject(err2);
        }

        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS patient (
            patientid INT(11) AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            dateOfBirth DATETIME
          ) ENGINE=InnoDB;
        `;

        db.query(createTableSQL, (err3) => {
          if (err3) {
            console.error("❌ Failed to create table:", err3);
            return reject(err3);
          }

          console.log("✅ Database and table are ready.");
          resolve();
        });
      });
    });
  });
}

module.exports = { createTable };

function insertSamplePatients(db, res) {
  const sql = `
                    INSERT INTO patient (name, dateOfBirth)
                    VALUES 
                    ('Sara Brown', '1901-01-01'),
                    ('John Smith', '1941-01-01'),
                    ('Jack Ma', '1961-01-30'),
                    ('Elon Musk', '1999-01-01');
                `;

  db.query(sql, (err, result) => {
    if (err)
      utils.sendResponse(res, 500, "Error inserting data: " + err.message);
    else utils.sendResponse(res, 200, `Inserted ${result.affectedRows} rows.`);
  });
}

function selectPatients(db, res, sql) {
  if (!sql || !sql.toLowerCase().startsWith("select"))
    return utils.sendResponse(res, 400, "Only SELECT queries allowed via GET.");

  if (!utils.isSafeQuery(sql))
    return utils.sendResponse(res, 403, "Query blocked: forbidden command.");

  db.query(sql, (err, results) => {
    if (err) utils.sendResponse(res, 500, "Error: " + err.message);
    else utils.sendResponse(res, 200, JSON.stringify(results, null, 4));
  });
}

function insertPatients(db, res, sql) {
  if (!sql || !sql.toLowerCase().startsWith("insert"))
    return utils.sendResponse(
      res,
      400,
      "Only INSERT queries allowed via POST."
    );

  if (!utils.isSafeQuery(sql))
    return utils.sendResponse(res, 403, "Query blocked: forbidden command.");

  db.query(sql, (err, result) => {
    if (err) utils.sendResponse(res, 500, "Error: " + err.message);
    else utils.sendResponse(res, 200, `Inserted ${result.affectedRows} rows.`);
  });
}

module.exports = {
  createTable,
  insertSamplePatients,
  selectPatients,
  insertPatients,
};
