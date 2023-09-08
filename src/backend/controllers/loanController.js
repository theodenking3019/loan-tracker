const { User } = require('../models/user');
const { getLoanDetailsByBorrower, mintNFTLoan, repayNFTLoan } = require('../utils/ethereum');

exports.postBorrow = async (req, res) => {
    try {
        const { amount } = req.body;

        // Fetch the user
        const user = await User.findByEmail(req.session.userEmail);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const txReceipt = await mintNFTLoan(user.ethereumAddress, amount);
        console.log(`Transaction hash: ${txReceipt.transactionHash}`);

        const loanDetails = await getLoanDetailsByBorrower(user.ethereumAddress)

        req.session.totalLoanAmount = loanDetails.amount.toString();
        req.session.outstandingBalance = loanDetails.outstandingBalance.toString();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to borrow funds." });
    }
}; 

exports.postRepay = async (req, res) => {
    try {
        const { amount } = req.body;

        // Fetch the user
        const user = await User.findByEmail(req.session.userEmail);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const repayTxReceipt = await repayNFTLoan(user.ethereumAddress, amount);
        console.log(`Transaction hash: ${repayTxReceipt.transactionHash}`);

        if (parseFloat(amount) >= parseFloat(req.session.outstandingBalance)) {
            req.session.totalLoanAmount = 0;
            req.session.outstandingBalance = 0;
        } else {
            req.session.outstandingBalance = parseFloat(req.session.outstandingBalance) - parseFloat(amount);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error processing repayment." });
    }
};