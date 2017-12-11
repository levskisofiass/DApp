var ExchangeOracle = artifacts.require("./Exchange/ExchangeOracle.sol");
var LOCExchange = artifacts.require("./Exchange/LOCExchange.sol");
var MintableToken = artifacts.require("./Tokens/MintableToken.sol");

module.exports = async function(deployer) {
    const initialRate = 5000; 

    let account1 = '0x009001BB05d1042A5dA4ce0479510e629A7b82dd';
    let account2 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

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

    await ERC20Instance.mint(account1, 200000000000000000000000);
    await ERC20Instance.mint(account2, 200000000000000000000000);
};