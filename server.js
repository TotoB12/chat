const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
