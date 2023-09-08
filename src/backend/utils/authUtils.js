const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { getLoanDetailsByBorrower } = require('./ethereum');


const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (!existingUser) {
            return res.json({ error: "No account found. Have you registered?" });
        }

        // If user exists and password matches, create a session for the user
        if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
            const loanDetails = await getLoanDetailsByBorrower(existingUser.ethereumAddress);
            req.session.userEmail = existingUser.email;
            req.session.userEthereumAddress = existingUser.ethereumAddress;
            req.session.totalLoanAmount = loanDetails.amount.toString();
            req.session.outstandingBalance = loanDetails.outstandingBalance.toString();
            res.json({ success: true });
        } else {
            return res.status(500).json({ error: "Password does not match!" });          
        }
    } catch (err) {
        return res.json({error: err.message});
    };
};

module.exports = {
    loginUser
 };