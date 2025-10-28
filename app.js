// chatGPT was used to code solutions presented in this assignment

require("dotenv").config();
const http = require("http");
const mysql = require("mysql2");
const url = require("url");
const utils = require("./modules/utils");
const patientService = require("./modules/patientService");

const PORT = 8081;

const insertPath = "/COMP4537/labs/5/api/v1/insert";
const queryPath = "/COMP4537/labs/5/api/v1/query";

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.code, err.message);
  } else {
    console.log("✅ Connected to DB successfully!");
  }
});

const server = http.createServer(async (req, res) => {
  try {
    await patientService.createTable(db); // waits properly
  } catch (err) {
    console.error("Error creating table:", err);
    return utils.sendResponse(res, 500, "DB setup failed.");
  }

  const parsedUrl = url.parse(req.url, true);

  if (req.method === "OPTIONS") {
    utils.sendResponse(res, 204, "");
    return;
  }

  if (req.method === "POST" && parsedUrl.pathname === insertPath) {
    patientService.insertSamplePatients(db, res);
  } else if (req.method === "GET" && parsedUrl.pathname === queryPath) {
    const sql = parsedUrl.query.sql;
    patientService.selectPatients(db, res, sql);
  } else if (req.method === "POST" && parsedUrl.pathname === queryPath) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let sql;
      try {
        const parsed = JSON.parse(body);
        sql = parsed.sql;
      } catch {
        return utils.sendResponse(res, 400, "Invalid JSON format.");
      }

      patientService.insertPatients(db, res, sql);
    });
  } else {
    utils.sendResponse(res, 404, "Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
