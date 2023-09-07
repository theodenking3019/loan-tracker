const { Web3 } = require('web3');
const loanContractJSON = require('../../../build/contracts/LoanNFT.json');

// Initialize web3. If you're connecting to a remote node, replace the provider.
const web3 = new Web3('http://localhost:8545');

// Initialize the web app's address. This will own the contract.
const ownerAccount = '0x0e90f67Cc36cf8b48a6b477F72154A69C620057F'; // The Ethereum account you're using
const ownerPrivateKey = Buffer.from('78572acd7cfe824f0ba2f340becd55430fd5ef5586134aa26da85bc4d948ae7d', 'hex'); // Private key for the account (KEEP THIS SAFE!)

// Read in my loan contract
const loanContractABI = loanContractJSON.abi;
const loanContractAddress = '0x48c5CCeCdA283377aC170CdD8F73d4d13Ed68fDa';
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
    console.log("signing tx");
    const signedTx = await web3.eth.accounts.signTransaction(mintTx, ownerPrivateKey);
    console.log("sending tx");
    console.log(signedTx);
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