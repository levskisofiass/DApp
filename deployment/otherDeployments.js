const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const exchangeOracleJson = require('../build/contracts/ExchangeOracle.json')
const locExchangeJson = require('../build/contracts/LOCExchange.json')
let exchangeOracleAbi = exchangeOracleJson.abi;
let exchangeOracleBytecode = exchangeOracleJson.bytecode;

let locExchangeAbi = locExchangeJson.abi;
let locExchangeBytecode = locExchangeJson.bytecode;

let apiKey = "Up5uvBHSCSqtOmnlhL87";
let LocTokenAddress = "0x5e3346444010135322268a4630d2ed5f8d09446c";
let initialRate = 606729;

(async function () {



	const privateKey = process.argv[2];

	const localNodeProvider = new providers.InfuraProvider(ethers.providers.networks.ropsten, apiKey);
	provider = new providers.FallbackProvider([
		localNodeProvider
	]);

	const wallet = new Wallet('0x' + privateKey);

	wallet.provider = provider;

	let exchangeOracleDeployTransaction = ethers.Contract.getDeployTransaction(exchangeOracleBytecode, exchangeOracleAbi, initialRate);
	exchangeOracleDeployTransaction.gasLimit = 4500000;
	exchangeOracleDeployTransaction.gasPrice = 13000000000;
	let exchangeOracleDeploy = await wallet.sendTransaction(exchangeOracleDeployTransaction);
	console.log(exchangeOracleDeploy);
	let resultExchangeOracleDeploy = await localNodeProvider.waitForTransaction(exchangeOracleDeploy.hash);
	let exchangeOracleAddress = resultExchangeOracleDeploy.creates;
	console.log(exchangeOracleAddress);



	let locExchangeTransaction = ethers.Contract.getDeployTransaction(locExchangeBytecode, locExchangeAbi, exchangeOracleAddress, LocTokenAddress);
	locExchangeTransaction.gasLimit = 4500000;
	locExchangeTransaction.gasPrice = 13000000000;
	let locExchangeDeploy = await wallet.sendTransaction(locExchangeTransaction);
	console.log(locExchangeDeploy);
	let resultLocExchangeDeploy = await localNodeProvider.waitForTransaction(locExchangeDeploy.hash);

	console.log(resultLocExchangeDeploy);


})()