/* eslint-disable no-undef */
const PORT = 8080;

const cookieSession = require('cookie-session');
const express = require('express');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ["key1, key2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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

const { ifUserExists } = require("./helpers");

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
  const uID = req.session.user_id;
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
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const user = ifUserExists(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      // eslint-disable-next-line camelcase
      req.session.user_id = user.userID;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid password.");
    }
  } else {
    res.status(403).send("Email not registered.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.session.user_id) {
    res.send("no");
    return;
  }
  const url = urlDatabase[req.params.shortURL];
  if (req.session.user_id !== req.session.user_id) {
    res.send("no2");
    return;
  }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("No");
    return;
  }
  const url = urlDatabase[req.params.shortURL];
  if (url.userID !== req.session.user_id) {
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
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id]
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
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});


app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
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
    // eslint-disable-next-line camelcase
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});