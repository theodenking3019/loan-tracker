const { User } = require('../models/user');
const { mintNFTLoan, repayNFTLoan } = require('../ethereum/web3');


exports.postBorrow = async (req, res) => {
    const { amount } = req.body;

    // Fetch the user
    const user = await User.findByEmail(req.session.userEmail);
    console.log("Found user "+ user.userEmail)

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Note: add error handling here to revert in case one operation fails. 
    // Requires updating the smart contract as well to include burn functionality for the NFT.
    const txReceipt = await mintNFTLoan(user.ethereumAddress, amount);

    await User.updateAmounts({ email: req.session.userEmail, principal: amount, balance: amount});

    req.session.totalLoanAmount = amount;
    req.session.outstandingBalance = amount;

    console.log('saved')

    res.json({ success: true });
};

exports.postRepay = async (req, res) => {
    const { amount } = req.body;
    console.log('Received repayment request for ' + amount);

    // Fetch the user
    const user = await User.findByEmail(req.session.userEmail);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const repayTxReceipt = await repayNFTLoan(user.ethereumAddress, amount);
    console.log(`Transaction hash: ${repayTxReceipt.transactionHash}`);
    
    if (parseFloat(amount) >= parseFloat(req.session.outstandingBalance)) {
        await User.updateAmounts({ email: req.session.userEmail, principal: 0, balance: 0});
        req.session.totalLoanAmount = 0;
        req.session.outstandingBalance = 0;
    } else {
        await User.updateAmounts({ email: req.session.userEmail, principal: user.totalLoanAmount, balance: user.outstandingBalance - amount});
        req.session.outstandingBalance = parseFloat(req.session.outstandingBalance) - parseFloat(amount);
    }

    res.json({ success: true });
};