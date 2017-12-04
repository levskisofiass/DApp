var ExchangeOracle = artifacts.require("./Exchange/ExchangeOracle.sol");
var LOCExchange = artifacts.require("./Exchange/LOCExchange.sol");
var MintableToken = artifacts.require("./Tokens/MintableToken.sol");

module.exports = async function(deployer) {
    const initialRate = 5000; 

    let ERC20Instance;
    let ExchangeOracleInstance
    let LOCExchangeInstance;

    // Token
    await deployer.deploy(MintableToken);    
    ERC20Instance = await MintableToken.deployed();

    // Oracle
    await deployer.deploy(ExchangeOracle, initialRate);
    ExchangeOracleInstance = await ExchangeOracle.deployed();

    // Exchange 
    await deployer.deploy(LOCExchange, ExchangeOracleInstance.address, ERC20Instance.address);    // ropsten - 0x13615ed1479b61751ce56189839f3a126e3847a9
    LOCExchangeInstance = await LOCExchange.deployed();
};