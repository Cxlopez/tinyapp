/* eslint-disable no-undef */
const express = require("express");
const app = express();
const PORT = 8080;

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// eslint-disable-next-line func-style
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let randomString = ' ';
  let charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
}

const ifUserExists = (email, database) => {
  for (const user in users) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const urlsForUser = (id, database) => {
  let usersUrl = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      usersUrl[shortURL] = database[shortURL];
    }
  }
  return usersUrl;
};

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    userID: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
  "user2RandomID": {
    userID: "user2RandomID",
    email: "user2@example.com",
    password: "a"
  }
};

app.get("/", (req, res) => {
  if (req.userID) {
    res.redirect("/urls");
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const uID = req.cookies["user_id"];
  const userUrls = urlsForUser(uID, urlDatabase);

  const templateVars = {
    user: users[uID],
    urls: userUrls
  };
  if (!uID) {
    res.send("Login or register to continue.");
    return;
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const user = ifUserExists(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.cookie("user_id", user.userID);
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid password.");
    }
  } else {
    res.status(403).send("Email not registered.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("no");
    return;
  }
  const url = urlDatabase[req.params.shortURL];
  if (req.cookies["user_id"] !== req.cookies["user_id"]) {
    res.send("no2");
    return;
  }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("No");
    return;
  }
  const url = urlDatabase[req.params.shortURL];
  if (url.userID !== req.cookies["user_id"]) {
    res.send("No2");
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send('Short URL does not exist');
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_registration', templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  console.log(users);
  if (!email || !hashedPassword) {
    res.status(400).send({message: "Please give valid Email & Password."});
  } else if (ifUserExists(email, users)) {
    res.status(400).send({message: "Email is already registered."});
  } else {
    const userID = generateRandomString();
    users[userID] = {
      userID,
      email: req.body.email,
      password: hashedPassword
    };
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});