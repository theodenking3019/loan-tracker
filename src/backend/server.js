const express = require('express');
const path = require('path');
const { connectDB } = require('./models/user');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // still need this to pick up styles
app.use(session({
    secret: 'random-secret-key', // Change this to a random secret key
    resave: false,
    saveUninitialized: false,
  }));
app.use(authRoutes); // Order matters here because routes use session
app.use(loanRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });