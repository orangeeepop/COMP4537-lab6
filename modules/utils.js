export function isSafeQuery(sql) {
  if (!sql) return false;
  const lower = sql.toLowerCase();
  const forbiddenWords = ["update", "delete", "drop", "alter", "truncate"];

  for (const word of forbiddenWords) {
    if (lower.includes(word)) {
      return false;
    }
  }
  return true;
}

export function sendResponse(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*", // enable CORS
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(data);
}
