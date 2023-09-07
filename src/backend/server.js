const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const { User, connectDB } = require('./models/user');
const app = express();
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const { mintNFTLoan, repayNFTLoan } = require('./ethereum/web3');


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
    console.log(req.session.totalLoanAmount);
    console.log(req.session.outstandingBalance);

    res.json({
      userEmail: req.session.userEmail,
      userEthereumAddress: req.session.userEthereumAddress,
      totalLoanAmount: req.session.totalLoanAmount,
      outstandingBalance: req.session.outstandingBalance,
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
        req.session.totalLoanAmount = existingUser.totalLoanAmount;
        req.session.outstandingBalance = existingUser.outstandingBalance;
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

    // Note: add error handling here to revert in case one operation fails. 
    // Requires updating the smart contract as well to include burn functionality for the NFT.
    console.log("minting NFT")
    const txReceipt = await mintNFTLoan(user.ethereumAddress, amount);
    console.log(`Transaction hash: ${txReceipt.transactionHash}`);

    console.log("saving loan terms to Mongo")
    await User.updateAmounts({ email: req.session.userEmail, principal: amount, balance: amount});

    req.session.totalLoanAmount = amount;
    req.session.outstandingBalance = amount;

    console.log('saved')

    res.json({ success: true });
});

app.post('/repay', async (req, res) => {
    const { amount } = req.body;
    console.log('Received repayment request for ' + amount);

    // Fetch the user
    const user = await User.findByEmail(req.session.userEmail);
    console.log("Found user "+ user.userEmail)

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    console.log("User's principal is " + user.totalLoanAmount)

    console.log("Updating NFT")
    const repayTxReceipt = await repayNFTLoan(user.ethereumAddress, amount);
    console.log(`Transaction hash: ${repayTxReceipt.transactionHash}`);
    
    console.log("saving repayment")
    if (parseFloat(amount) >= parseFloat(req.session.outstandingBalance)) {
        await User.updateAmounts({ email: req.session.userEmail, principal: 0, balance: 0});
        req.session.totalLoanAmount = 0;
        req.session.outstandingBalance = 0;
    } else {
        console.log("repayment amount is less than outstanding balance. Updating Loan terms.")
        console.log("Payment amount: " + amount);
        console.log("Outstanding balance: " + req.session.outstandingBalance);
        await User.updateAmounts({ email: req.session.userEmail, principal: user.totalLoanAmount, balance: user.outstandingBalance - amount});
        req.session.outstandingBalance = parseFloat(req.session.outstandingBalance) - parseFloat(amount);
    }

    console.log('saved')

    res.json({ success: true });
});


connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });