const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const crypto = require("crypto");

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//genearte a random string as id for short URL
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

//requests page to add new website
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//adds a website to the databse while generating new URL
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

//deletes URL from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

//edits corresponding URL of id
app.post("/urls/:id/edit", (req, res) => {
  let websiteLink = req.body.longURL
  if (!websiteLink.startsWith("http://") && !websiteLink.startsWith("https://")) {
    websiteLink = `http://${websiteLink}`
  }
  urlDatabase[req.params.id] = websiteLink;
  res.redirect(302, "/urls/");
});

//displays database in json fromat
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//index page showing all URLs and ids
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//page for indiviual shortend URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, port:port };
  res.render("urls_show", templateVars);
});

//redirect link for URLs in database
app.get("/u/:id", (req, res) => {
  res.redirect(302, urlDatabase[req.params.id]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

