const { Web3 } = require('web3');
const CustomError = require('../utils/customError');
const loanContractJSON = require('../../../build/contracts/LoanNFT.json');

const web3Provider = process.env.WEB3_PROVIDER;
const ownerAccount = process.env.ETHEREUM_OWNER_ACCOUNT;
const ownerPrivateKey = Buffer.from(
    process.env.ETHEREUM_OWNER_PRIVATE_KEY,
    'hex'
);
const loanContractAddress = process.env.LOAN_CONTRACT_ADDRESS;

// Initialize web3. If you're connecting to a remote node, replace the provider.
const web3 = new Web3(web3Provider);

// Read in my loan contract
const loanContractABI = loanContractJSON.abi;
const loanNFTContract = new web3.eth.Contract(
    loanContractABI,
    loanContractAddress
);

// Function to create an Ethereum address when the user registers
const createEthereumAddress = () => {
    try {
        const account = web3.eth.accounts.create();
        return {
            address: account.address,
            privateKey: account.privateKey
        };
    } catch (err) {
        console.error('Failed to create Ethereum wallet for the user.', err);
        process.exit(1);
    }
};

// Function to find a borrower's current loan
const fetchCurrentLoanId = async borrowerAddress => {
    try {
        const loanId = await loanNFTContract.methods
            .outstandingBorrowerLoans(borrowerAddress)
            .call();
        return loanId;
    } catch (err) {
        throw new CustomError('Error fetching loan ID: ' + err, 500);
    }
};

// Function to get the loan details
const getLoanDetails = async loanId => {
    try {
        const details = await loanNFTContract.methods
            .getLoanDetails(loanId)
            .call();
        return details;
    } catch (err) {
        throw new CustomError('Error fetching loan details: ' + err, 500);
    }
};

const getLoanDetailsByBorrower = async borrowerAddress => {
    try {
        const loanId = await fetchCurrentLoanId(borrowerAddress);
        const details = await getLoanDetails(loanId);
        return details;
    } catch (err) {
        throw new CustomError(
            'Error fetching borrower loan details: ' + err,
            500
        );
    }
};

// Function to mint a loan
const mintNFTLoan = async (borrowerAddress, amount) => {
    try {
        const mintLoanEstimatedGas = await loanNFTContract.methods
            .mintLoan(borrowerAddress, amount)
            .estimateGas({
                from: ownerAccount
            });
        const mintTx = {
            from: ownerAccount,
            to: loanContractAddress,
            data: loanNFTContract.methods
                .mintLoan(borrowerAddress, amount)
                .encodeABI(),
            gas: mintLoanEstimatedGas,
            gasPrice: web3.utils.toWei('10', 'gwei')
        };
        const signedTx = await web3.eth.accounts.signTransaction(
            mintTx,
            ownerPrivateKey
        );
        const txReceipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
        );
        return txReceipt;
    } catch (err) {
        throw new CustomError('Failed to mint loan NFT.', 500);
    }
};

// Function to record repaymens on the loan NFT
const repayNFTLoan = async (borrowerAddress, amount) => {
    try {
        const repayLoanEstimatedGas = await loanNFTContract.methods
            .repayByBorrower(borrowerAddress, amount)
            .estimateGas({
                from: ownerAccount
            });
        const repayTx = {
            from: ownerAccount,
            to: loanContractAddress,
            data: loanNFTContract.methods
                .repayByBorrower(borrowerAddress, amount)
                .encodeABI(),
            gas: repayLoanEstimatedGas,
            gasPrice: web3.utils.toWei('10', 'gwei')
        };
        const signedRepayTx = await web3.eth.accounts.signTransaction(
            repayTx,
            ownerPrivateKey
        );
        const repayTxReceipt = await web3.eth.sendSignedTransaction(
            signedRepayTx.rawTransaction
        );
        return repayTxReceipt;
    } catch (err) {
        throw new CustomError('Failed to update loan NFT with payment.', 500);
    }
};

module.exports = {
    createEthereumAddress,
    getLoanDetailsByBorrower,
    mintNFTLoan,
    repayNFTLoan
};
