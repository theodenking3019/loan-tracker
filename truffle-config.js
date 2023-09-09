module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '*'
        }
    },
    compilers: {
        solc: {
            version: '0.8.4' // Change this to whatever version your contract uses
        }
    },
    contracts_directory: './src/backend/ethereum/contracts/',
    migrations_directory: './src/backend/ethereum/migrations/'
};
