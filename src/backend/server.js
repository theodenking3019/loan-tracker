const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const { User, connectDB } = require('./models/user');
const app = express();
const session = require('express-session');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(session({
    secret: 'random-secret-key', // Change this to a random secret key
    resave: false,
    saveUninitialized: false,
  }));
  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/account', (req, res) => {
    console.log("Received request for /account");
    if (!req.session.userEmail) {
        return res.redirect('/login'); // Redirect to login if no session is active
      }
    res.sendFile(path.join(__dirname, '../frontend/account.html'));
});

app.get('/account-data', (req, res) => {
    console.log("Received request for /account-data");
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    console.log(req.session.userEmail);
    console.log(req.session.userEthereumAddress);

    res.json({
      userEmail: req.session.userEmail,
      userEthereumAddress: req.session.userEthereumAddress 
    });
  });

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        return res.json({ error: true });
    }
    
    await User.create({ 
        email, 
        password
    });
    console.log("Received registration request for:", email);
    res.json({ success: true });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);

    if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
        // If user exists and password matches, create a session for the user
        req.session.userEmail = existingUser.email;
        req.session.userEthereumAddress = existingUser.ethereumAddress;
        res.json({ success: true });
      } else {
        res.json({ error: true });
      }
});

app.get('/logout', (req, res) => {
    req.session.destroy();  // Destroy session
    res.redirect('/');      // Redirect to root
  });

app.post('/borrow', async (req, res) => {
    const { amount } = req.body;
    console.log('Received request to borrow ' + amount);

    // Fetch the user
    const user = await User.findByEmail(req.session.userEmail);
    console.log("Found user "+ user.userEmail)

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    console.log("saving loan terms")
    await User.updateAmounts({ email: req.session.userEmail, amount: amount});
    console.log('saved')

    res.json({ success: true });
});


connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });