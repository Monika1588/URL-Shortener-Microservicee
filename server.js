const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let urlDatabase = [];
let counter = 1;

app.post("/api/shorturl", (req, res) => {
  let original_url = req.body.url;

  let hostname;
  try {
    hostname = new URL(original_url).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {

      let existing = urlDatabase.find((entry) => entry.original_url === original_url);
      if (existing) {
        res.json(existing);
      } else {
        let newEntry = { original_url, short_url: counter++ };
        urlDatabase.push(newEntry);
        res.json(newEntry);
      }
    }
  });
});

app.get("/api/shorturl/:short", (req, res) => {
  let short = parseInt(req.params.short);
  let entry = urlDatabase.find((e) => e.short_url === short);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

const port = 3200;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
    