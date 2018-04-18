const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const crypto = require("crypto");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString () {
  const id = crypto.randomBytes(3).toString("hex");
  return id;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let newid = generateRandomString();
  while (newid == urlDatabase[newid]) {
    let newid = generateRandomString();
  }
  let websiteLink = req.body.longURL
  if (!websiteLink.startsWith("http://") && !websiteLink.startsWith("https://")) {
    websiteLink = `http://${websiteLink}`
  }
  urlDatabase[newid] = websiteLink;
  res.redirect(302, `/urls/${newid}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls")
});

app.post("/urls/:id/edit", (req, res) => {
  let websiteLink = req.body.longURL
  if (!websiteLink.startsWith("http://") && !websiteLink.startsWith("https://")) {
    websiteLink = `http://${websiteLink}`
  }
  urlDatabase[req.params.id] = websiteLink;
  res.redirect(302, `/urls/${req.params.id}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  console.log(req.params.id);
  res.redirect(302, urlDatabase[req.params.id]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

