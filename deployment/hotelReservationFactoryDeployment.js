const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const hotelReservationFactoryJson = require('../build/contracts/HotelReservationFactory.json')
const iHotelReservationFactoryJson = require('../build/contracts/IHotelReservationFactory.json')
const hotelReservationFactoryProxyJson = require('../build/contracts/HotelReservationFactoryProxy.json')
let factoryAbi = hotelReservationFactoryJson.abi;
let factoryBytecode = hotelReservationFactoryJson.bytecode;
let factoryProxyAbi = hotelReservationFactoryProxyJson.abi;
let factoryproxyBytecode = hotelReservationFactoryProxyJson.bytecode;
let iFactoryAbi = iHotelReservationFactoryJson.abi;
let LocTokenAddress = "0x5e3346444010135322268a4630d2ed5f8d09446c";

let cyclesCountForWithdraw = 50
let setDisputeDestinationAddress = '0xa99c523BfC2E1374ac528FE39e4dD7c35F6C1d46'
let setWirhdrawDestinationAddress = '0xa99c523BfC2E1374ac528FE39e4dD7c35F6C1d46'
let hotelReservationImplAdr = '0xd6f17aBe7DD0B0E1315a8970adf24FEa70738Be2';


let apiKey = "Up5uvBHSCSqtOmnlhL87";



(async function () {

	const privateKey = process.argv[2];

	const localNodeProvider = new providers.InfuraProvider(ethers.providers.networks.ropsten, apiKey);
	provider = new providers.FallbackProvider([
		localNodeProvider
	]);

	const wallet = new Wallet('0x' + privateKey);

	wallet.provider = provider;

	let deployHotelReservationFactory = ethers.Contract.getDeployTransaction(factoryBytecode, factoryAbi);
	deployHotelReservationFactory.gasLimit = 4500000;
	deployHotelReservationFactory.gasPrice = 13000000000;
	let factoryDeploy = await wallet.sendTransaction(deployHotelReservationFactory, );
	console.log(factoryDeploy);
	let resultFactoryDeploy = await localNodeProvider.waitForTransaction(factoryDeploy.hash);
	let factoryAddress = resultFactoryDeploy.creates;

	let deployHotelReservationFactoryProxy = ethers.Contract.getDeployTransaction(factoryproxyBytecode, factoryProxyAbi, factoryAddress);
	deployHotelReservationFactoryProxy.gasLimit = 4500000;
	deployHotelReservationFactoryProxy.gasPrice = 13000000000;
	let factoryProxyDeploy = await wallet.sendTransaction(deployHotelReservationFactoryProxy, overrideOptions);
	console.log(factoryProxyDeploy);

	let resultFactoryProxyDeploy = await localNodeProvider.waitForTransaction(factoryProxyDeploy.hash);

	let factoryProxyAddress = resultFactoryProxyDeploy.creates

	const factoryProxyInstance = new ethers.Contract(factoryProxyAddress, iFactoryAbi, wallet);

	const finalResult = await factoryProxyInstance.init({
		gasLimit: 4500000,
		gasPrice: 13000000000
	});
	console.log(finalResult);

	let finalTransactionResult = await localNodeProvider.waitForTransaction(finalResult.hash);

	let setHotelReservationImplAddress = await factoryProxyInstance.setImplAddress(hotelReservationImplAdr)

	let setTokenContract = await factoryProxyInstance.setLOCTokenContractAddress(LocTokenAddress);
	console.log(setTokenContract);
	await localNodeProvider.waitForTransaction(setTokenContract.hash);

	let cyclesCount = await factoryProxyInstance.setmaxAllowedWithdrawCyclesCount(cyclesCountForWithdraw);
	console.log(cyclesCount);
	await localNodeProvider.waitForTransaction(cyclesCount.hash);

	let setDisputeDestination = await factoryProxyInstance.setDisputeDestinationAddress(setDisputeDestinationAddress);
	console.log(setDisputeDestination);
	await localNodeProvider.waitForTransaction(setDisputeDestination.hash);

	let setWithdrawer = await factoryProxyInstance.setWithdrawerAddress(setDisputeDestinationAddress);
	console.log(setWithdrawer);
	await localNodeProvider.waitForTransaction(setWithdrawer.hash);

	let setWithdrawerDestination = await factoryProxyInstance.setWithdrawDestinationAddress(setWirhdrawDestinationAddress);
	console.log(setWithdrawerDestination);
	await localNodeProvider.waitForTransaction(setWithdrawerDestination.hash);



	// console.log(finalTransactionResult);
})()