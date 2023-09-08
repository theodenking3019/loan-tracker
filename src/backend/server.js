require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./models/user');
const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const sessionMiddleware = require('./middleware/session');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // still need this to pick up styles
app.use(sessionMiddleware);
app.use(authRoutes); // Order matters here because routes use session
app.use(loanRoutes);
app.use(requestLogger);
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });