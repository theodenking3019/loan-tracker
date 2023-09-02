
const Wallet = require('ethereumjs-wallet');

function createEthereumAddress() {
    const wallet = Wallet.generate();
    const address = wallet.getAddressString();
    const privateKey = wallet.getPrivateKeyString();
    return { address, privateKey };
}

module.exports = { createEthereumAddress };
