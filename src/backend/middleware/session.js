const session = require('express-session');

module.exports = session({
    secret: 'random-secret-key', // Change this to a random secret key
    resave: false,
    saveUninitialized: false,
});
