const session = require('express-session');

const sessionSecretKey = process.env.SESSION_SECRET_KEY

module.exports = session({
    secret: sessionSecretKey,
    resave: false,
    saveUninitialized: false,
});
