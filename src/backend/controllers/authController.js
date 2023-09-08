const path = require('path');
const { User } = require('../models/user');
const { getLoanDetailsByBorrower } = require('../utils/ethereum');
const { loginUser } = require('../utils/authUtils');

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

exports.postLogin = async (req, res, next) => {
    try {
        await loginUser(req, res, next);
    } catch (err) {
        return res.json({error: err.message});
    }
};

exports.postRegister = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.json({ error: " Account already exists! Try logging in instead." });
        }

        await User.create({ 
            email, 
            password
        });

        await loginUser(req, res, next);

    } catch (err) {
        return res.json({error: err.message});  
    }
};

exports.getAccountData = async (req, res, next) => {
    try {
        if (!req.session.userEmail) {
          return res.status(401).json({ error: "Not authorized to view account data. Ensure you've logged in." });
        }

        const loanDetails = await getLoanDetailsByBorrower(req.session.userEthereumAddress);

        res.json({
          userEmail: req.session.userEmail,
          userEthereumAddress: req.session.userEthereumAddress,
          totalLoanAmount: loanDetails.amount.toString(),
          outstandingBalance: loanDetails.outstandingBalance.toString(),
        });
    } catch (err) {
        next(err);    
    }
};

