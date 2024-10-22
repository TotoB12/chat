const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;

const mimeType = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
};

app.get("*", (req, res) => {
  console.log(`  ${req.method} ${req.url}`);

  let sanitizedPath = path
    .normalize(req.path)
    .replace(/^(\.\.[\/\\])+/, "")
    .substring(1);

  if (sanitizedPath === "") {
    sanitizedPath = "index.html";
  }

  const ext = path.parse(sanitizedPath).ext;

  fs.readFile(sanitizedPath, (err, data) => {
    if (err) {
      res.status(404).end();
    } else {
      if (mimeType[ext]) {
        res.setHeader("Content-Type", mimeType[ext]);
      }
      res.end(data);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
