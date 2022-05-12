const ifUserExists = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};


const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let randomString = ' ';
  let charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomString;
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

module.exports = { ifUserExists, generateRandomString, urlsForUser };