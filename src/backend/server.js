const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const { User, connectDB } = require('./models/user');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.post('/register', async (req, res) => {
    const { email, password, address, privateKey } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        return res.json({ error: true });
    }
    
    await User.create({ 
        email, 
        password,
        ethereumAddress: address, 
        ethereumPrivateKey: privateKey
    });
    console.log("Received registration request for:", email);
    res.json({ success: true });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
        return res.json({ error: true });
    }
    
    console.log("User logged in:", email);
    res.json({ success: true });
});

connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });