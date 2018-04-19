const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cookieParser = require("cookie-Parser")

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

//genearte a random string as id for short URL
function generateRandomString () {
  const id = crypto.randomBytes(3).toString("hex");
  return id;
}

const urlDatabase = {
  "b2xVn2": {link: "http://www.lighthouselabs.ca", creatorid: "hardcodedID"},
  "9sm5xK": {link: "http://www.google.com", creatorid: "hardcodedID"}
};

const usersDatabase = {
  "hardcodedID": {
    id: "hardcodedID",
    email: "user@example.com",
    password: "user"
  },
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

//requests page to add new website
app.get("/urls/new", (req, res) => {
  function logincheck () {
    for (user in usersDatabase) {
      if (usersDatabase[user].id === req.cookies["id"]) {
        return true;
      }
    }
  }
  if (logincheck()) {
    let templateVars = { urls: urlDatabase, theUser: usersDatabase[req.cookies["id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(302, "/login")
  }
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
  urlDatabase[newid] = { link: websiteLink, creatorid: req.cookies["id"] }
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
  res.redirect(302, "/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect(302, "/urls");
});

//Registration handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Empty email or password");
  };
  for (user in usersDatabase) {
    if (usersDatabase[user].email == req.body.email) {
    res.status(400).send("Email already registered");
    }
  }
  let userid = generateRandomString();
  while (userid == usersDatabase[userid]) {
    let userid = generateRandomString();
  }
  let userinfo = {id: userid, email: req.body.email, password: req.body.password}
  usersDatabase[userid] = userinfo;
  res.cookie("id", userinfo.id)
  res.redirect(302, "/urls");
});

//login handler
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Empty email or password");
  }
  const emailcheck = () => {
    for (user in usersDatabase) {
      if (usersDatabase[user].email === req.body.email) {
        let loginid = usersDatabase[user].id;
        return loginid;
      }
    };
  }
  if (emailcheck()) {
    if (usersDatabase[user].password === req.body.password) {
        res.cookie("id", usersDatabase[user].id);
        res.redirect(302, "/");
      } else {
        res.status(403).send("Invalid password");
      };
    } else {
      res.status(403).send("Email not found");
    };
});

//login page
app.get("/login", (req, res) => {
  res.render("login")
});

//displays database in json fromat
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//index page showing all URLs and ids
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, theUser: usersDatabase[req.cookies["id"]] };
  res.render("urls_index", templateVars);
});

//page for indiviual shortend URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, port:port, theUser: usersDatabase[req.cookies["id"]] };
  res.render("urls_show", templateVars);
});

//redirect link for URLs in database
app.get("/u/:id", (req, res) => {
  res.redirect(302, urlDatabase[req.params.id]);
});

//Returns registration page
app.get("/register", (req, res) => {
  res.render("registration")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

