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

let cyclesCountForWithdraw = 70
let setDisputeDestinationAddress = '0xa99c523BfC2E1374ac528FE39e4dD7c35F6C1d46'
let setWirhdrawDestinationAddress = '0xa99c523BfC2E1374ac528FE39e4dD7c35F6C1d46'
let withdrawer = '0x40B9f8957d9444bD56566B0c277F4c83Eb902fb5'
let hotelReservationImplAdr = '0x0674Ec052FE9220a9Af7a34Ff4640c0389B6A4bb';


let apiKey = "Up5uvBHSCSqtOmnlhL87";



(async function () {

	const privateKey = process.argv[2];

	const localNodeProvider = new providers.InfuraProvider(ethers.providers.networks.mainnet, apiKey);
	provider = new providers.FallbackProvider([
		localNodeProvider
	]);

	const wallet = new Wallet('0x' + privateKey);

	wallet.provider = provider;

	// let deployHotelReservationFactory = ethers.Contract.getDeployTransaction(factoryBytecode, factoryAbi);
	// deployHotelReservationFactory.gasLimit = 4500000;
	// deployHotelReservationFactory.gasPrice = 15000000000;
	// let factoryDeploy = await wallet.sendTransaction(deployHotelReservationFactory, );
	// console.log(factoryDeploy);
	// let resultFactoryDeploy = await localNodeProvider.waitForTransaction(factoryDeploy.hash);
	// let factoryAddress = resultFactoryDeploy.creates;
	// console.log(factoryAddress, "HOTEL RESERVATION FACTORY ADDRESS")

	// let factoryAddress = '0x1055f1925A00a3A8397a3FDf13d4C416F797100f'

	// let deployHotelReservationFactoryProxy = ethers.Contract.getDeployTransaction(factoryproxyBytecode, factoryProxyAbi, factoryAddress);
	// deployHotelReservationFactoryProxy.gasLimit = 4500000;
	// deployHotelReservationFactoryProxy.gasPrice = 15000000000;
	// let factoryProxyDeploy = await wallet.sendTransaction(deployHotelReservationFactoryProxy);
	// console.log(factoryProxyDeploy);

	// let resultFactoryProxyDeploy = await localNodeProvider.waitForTransaction(factoryProxyDeploy.hash);

	// let factoryProxyAddress = resultFactoryProxyDeploy.creates
	// console.log(factoryProxyAddress, "HOTEL RESERVATION FACTORY PROXY ADDRESS");


	// const factoryProxyInstance = new ethers.Contract(factoryProxyAddress, iFactoryAbi, wallet);

	// const finalResult = await factoryProxyInstance.init({
	// 	gasLimit: 4500000,
	// 	gasPrice: 15000000000
	// });
	// console.log(finalResult);

	// let finalTransactionResult = await localNodeProvider.waitForTransaction(finalResult.hash);

	// let setHotelReservationImplAddress = await factoryProxyInstance.setImplAddress(hotelReservationImplAdr)
	// console.log("SET IMPL ADDRESS")
	// await localNodeProvider.waitForTransaction(setHotelReservationImplAddress.hash);

	// let setTokenContract = await factoryProxyInstance.setLOCTokenContractAddress(LocTokenAddress);
	// console.log(setTokenContract);
	// await localNodeProvider.waitForTransaction(setTokenContract.hash);

	// let cyclesCount = await factoryProxyInstance.setmaxAllowedWithdrawCyclesCount(cyclesCountForWithdraw);
	// console.log(cyclesCount);
	// await localNodeProvider.waitForTransaction(cyclesCount.hash);

	// let setDisputeDestination = await factoryProxyInstance.setDisputeDestinationAddress(setDisputeDestinationAddress);
	// console.log(setDisputeDestination);
	// await localNodeProvider.waitForTransaction(setDisputeDestination.hash);

	// let setWithdrawer = await factoryProxyInstance.setWithdrawerAddress(withdrawer);
	// console.log(setWithdrawer);
	// await localNodeProvider.waitForTransaction(setWithdrawer.hash);

	let setWithdrawerDestination = await factoryProxyInstance.setWithdrawDestinationAddress(setWirhdrawDestinationAddress);
	console.log(setWithdrawerDestination);
	await localNodeProvider.waitForTransaction(setWithdrawerDestination.hash);



	// console.log(finalTransactionResult);
})()