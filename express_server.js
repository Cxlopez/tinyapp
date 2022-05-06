/* eslint-disable no-undef */
const express = require("express");
const app = express();
const PORT = 8080;

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

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);       // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${randomString}`);
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = ifUserExists(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie("user_id", user.userID);
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid password.");
    }
  } else {
    res.status(403).send("Email no registered.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send({message: "Please give valid Email & Password."});
  } else if (ifUserExists(email, users)) {
    res.status(400).send({message: "Email is already registered."});
  } else {
    const userID = generateRandomString();
    users[userID] = {
      userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});