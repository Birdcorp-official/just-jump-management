const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const FILE = "sessions.json";

function readSessions() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveSessions(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get("/sessions", (req, res) => {
  res.json(readSessions());
});

app.post("/sessions", (req, res) => {
  const sessions = readSessions();
  sessions.push(req.body);
  saveSessions(sessions);
  res.json({ ok: true });
});

app.post("/delete", (req, res) => {
  const sessions = readSessions().filter(s => s.id !== req.body.id);
  saveSessions(sessions);
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});