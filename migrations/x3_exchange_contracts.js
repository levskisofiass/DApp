var ExchangeOracle = artifacts.require("./Exchange/ExchangeOracle.sol");
var LOCExchange = artifacts.require("./Exchange/LOCExchange.sol");
var MintableToken = artifacts.require("./Tokens/MintableToken.sol");

module.exports = async function (deployer) {
    const initialRate = 5000;

    let account1 = '0x919df2d59d0667764bfe25ecf2a457bef0156a94';
    let account2 = '0x7767e15abf2fd17bce0acfc834155182e56bb313';
    let account3 = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';

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
    await deployer.deploy(LOCExchange, ExchangeOracleInstance.address, ERC20Instance.address); // ropsten - 0x13615ed1479b61751ce56189839f3a126e3847a9
    LOCExchangeInstance = await LOCExchange.deployed();

    await ERC20Instance.mint(account1, 200000000000000000000000);
    await ERC20Instance.mint(account2, 200000000000000000000000);
    await ERC20Instance.mint(account3, 200000000000000000000000);
};