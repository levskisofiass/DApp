var HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const config = require('./config.json');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4700036
    },
    ropstenInfura: {
      provider: new HDWalletProvider(config.PRIVATE_KEY, "https://ropsten.infura.io/" + config.INFURA_API_KEY),
      network_id: 3,
      gas: 4700036
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};