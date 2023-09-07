const bcrypt = require('bcrypt');
const path = require('path');
const { User } = require('../models/user');

exports.getRoot = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
};

exports.getLogin = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/login.html'));
};

exports.getLogout = async (req, res) => {
    req.session.destroy();  // Destroy session
    res.redirect('/');      // Redirect to root
};

exports.getRegister = async (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/register.html'));
};

exports.getAccount = async (req, res) => {
    if (!req.session.userEmail) {
        return res.redirect('/login'); // Redirect to login if no session is active
      }
    res.sendFile(path.join(__dirname, '../../frontend/account.html'));
};

exports.getAccountData = async (req, res) => {
    console.log("Received request for /account-data");
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json({
      userEmail: req.session.userEmail,
      userEthereumAddress: req.session.userEthereumAddress,
      totalLoanAmount: req.session.totalLoanAmount,
      outstandingBalance: req.session.outstandingBalance,
    });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);

    if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
        // If user exists and password matches, create a session for the user
        req.session.userEmail = existingUser.email;
        req.session.userEthereumAddress = existingUser.ethereumAddress;
        req.session.totalLoanAmount = existingUser.totalLoanAmount;
        req.session.outstandingBalance = existingUser.outstandingBalance;
        res.json({ success: true });
      } else {
        res.json({ error: true });
      }
};

exports.postRegister = async (req, res) => {
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
    res.json({ success: true });
};

//... other auth related controllers can be added here, e.g. login, logout