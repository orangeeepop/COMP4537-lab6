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
    // optional: ensure table at startup
    patientService.createTable(db).catch((e) =>
      console.error("❌ Table creation at startup failed:", e.message)
    );
  }
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === "OPTIONS") {
    utils.sendResponse(res, 204, "");
    return;
  }

  try {
    if (req.method === "POST" && parsedUrl.pathname === insertPath) {
      await patientService.createTable(db);
      patientService.insertSamplePatients(db, res);

    } else if (req.method === "GET" && parsedUrl.pathname === queryPath) {
      const sql = parsedUrl.query.sql;
      await patientService.createTable(db);
      patientService.selectPatients(db, res, sql);

    } else if (req.method === "POST" && parsedUrl.pathname === queryPath) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        let sql;
        try {
          const parsed = JSON.parse(body);
          sql = parsed.sql;
        } catch {
          return utils.sendResponse(res, 400, "Invalid JSON format.");
        }

        try {
          await patientService.createTable(db);
          patientService.insertPatients(db, res, sql);
        } catch (err) {
          utils.sendResponse(res, 500, err.message);
        }
      });

    } else {
      utils.sendResponse(res, 404, "Not Found");
    }
  } catch (err) {
    console.error("❌ Error handling request:", err);
    utils.sendResponse(res, 500, err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
