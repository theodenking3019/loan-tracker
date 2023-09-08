const { Web3 } = require('web3');
const loanContractJSON = require('../../../build/contracts/LoanNFT.json');

const web3Provider = process.env.WEB3_PROVIDER;
const ownerAccount = process.env.ETHEREUM_OWNER_ACCOUNT;
const ownerPrivateKey = Buffer.from(process.env.ETHEREUM_OWNER_PRIVATE_KEY, 'hex');
const loanContractAddress = process.env.LOAN_CONTRACT_ADDRESS;

// Initialize web3. If you're connecting to a remote node, replace the provider.
const web3 = new Web3(web3Provider);

// Read in my loan contract
const loanContractABI = loanContractJSON.abi;
const loanNFTContract = new web3.eth.Contract(loanContractABI, loanContractAddress);

// Function to create an Ethereum address when the user registers
const createEthereumAddress = () => {
    const account = web3.eth.accounts.create();
    return {
        address: account.address,
        privateKey: account.privateKey
    };
};

// Function to mint a loan
const mintNFTLoan = async (borrowerAddress, amount) => {
    const mintLoanEstimatedGas = await loanNFTContract.methods.mintLoan(borrowerAddress, amount).estimateGas({
        from: ownerAccount
    });
    const mintTx = {
        from: ownerAccount,
        to: loanContractAddress,
        data: loanNFTContract.methods.mintLoan(borrowerAddress, amount).encodeABI(),
        gas: mintLoanEstimatedGas,
        gasPrice: web3.utils.toWei('10', 'gwei')
    };
    const signedTx = await web3.eth.accounts.signTransaction(mintTx, ownerPrivateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return txReceipt;
};

// Function to record repaymens on the loan NFT
const repayNFTLoan = async (borrowerAddress, amount) => {
    const repayLoanEstimatedGas = await loanNFTContract.methods.repayByBorrower(borrowerAddress, amount).estimateGas({
        from: ownerAccount
    });
    const repayTx = {
        from: ownerAccount,
        to: loanContractAddress,
        data: loanNFTContract.methods.repayByBorrower(borrowerAddress, amount).encodeABI(),
        gas: repayLoanEstimatedGas,
        gasPrice: web3.utils.toWei('10', 'gwei')
    };
    const signedRepayTx = await web3.eth.accounts.signTransaction(repayTx, ownerPrivateKey);
    const repayTxReceipt = await web3.eth.sendSignedTransaction(signedRepayTx.rawTransaction);
    return repayTxReceipt;
};

module.exports = {
    createEthereumAddress, 
    mintNFTLoan,
    repayNFTLoan  
};