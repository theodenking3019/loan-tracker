const { Web3 } = require('web3');
const ganache = require("ganache");


// Initialize web3. If you're connecting to a remote node, replace the provider.
const web3 = new Web3(ganache.provider());

const createEthereumAddress = () => {
    const account = web3.eth.accounts.create();
    return {
        address: account.address,
        privateKey: account.privateKey
    };
};

module.exports = { createEthereumAddress };
