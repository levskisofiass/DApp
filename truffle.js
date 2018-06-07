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
      provider: function () {
        return new HDWalletProvider(config.PRIVATE_KEY, "https://ropsten.infura.io/" + config.INFURA_API_KEY)
      },
      network_id: 3,
      gas: 4700036
    },
    rinkeby: {
      provider: new HDWalletProvider(config.PRIVATE_KEY, "https://rinkeby.infura.io/" + config.INFURA_API_KEY),
      network_id: 4,
      port: 8545,
      gas: 4000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};