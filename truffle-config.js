require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*'
        },
        arbitrumGoerli: {
            provider: () => new HDWalletProvider({ 
                privateKeys: [process.env.ETHEREUM_OWNER_PRIVATE_KEY], 
                providerOrUrl: process.env.WEB3_PROVIDER
            }),
            network_id: 421613,
            gas: 8000000,
            confirmations: 1,
            timeoutBlocks: 10, 
            skipDryRun: true
        }
    },
    compilers: {
        solc: {
            version: '0.8.18', // Change this to whatever version your contract uses
            settings: {
                optimizer: {
                  enabled: true,
                  runs: 200
                }
            }
        }
    },
    contracts_directory: './src/backend/ethereum/contracts/',
    migrations_directory: './src/backend/ethereum/migrations/'
};
