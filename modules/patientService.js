const utils = require("./utils");

async function createTable(db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      age INT,
      diagnosis VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, (err) => {
      if (err) reject(err);
      else {
        console.log("✅ Table ensured.");
        resolve();
      }
    });
  });
}

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
