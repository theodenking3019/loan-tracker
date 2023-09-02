const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const User = require('./models/user');
const app = express();
const session = require('express-session');
const PORT = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.get('/login', async (req, res) => {
    res.send('Welcome back!');
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    await User.create({ email, password });
    res.send('User registered successfully');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid credentials');
    }

    // Handle sessions or tokens here
    req.session.userId = user._id;
    res.send('Logged in successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});