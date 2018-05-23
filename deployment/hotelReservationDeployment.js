const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const hotelReservationJson = require('../build/contracts/HotelReservation.json')
let abi = hotelReservationJson.abi;
let bytecode = hotelReservationJson.bytecode;
let apiKey = "Up5uvBHSCSqtOmnlhL87";



(async function () {


	const privateKey = process.argv[2];

	const localNodeProvider = new providers.InfuraProvider(ethers.providers.networks.mainnet, apiKey);
	provider = new providers.FallbackProvider([
		localNodeProvider
	]);

	const wallet = new Wallet('0x' + privateKey);

	wallet.provider = provider;

	let deployTransaction = ethers.Contract.getDeployTransaction(bytecode, abi);
	deployTransaction.gasLimit = 4500000;
	deployTransaction.gasPrice = 15000000000;
	let transaction = await wallet.sendTransaction(deployTransaction);
	console.log(transaction);


	let result = await localNodeProvider.waitForTransaction(transaction.hash);

	console.log(result);
	console.log("Hotel Reservation");

})()