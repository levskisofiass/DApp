const moment = require("moment");

let RentalReservationProxy = artifacts.require("./../RentalReservation/RentalReservationProxy.sol")
let RentalReservation = artifacts.require("./../RentalReservation/RentalReservation.sol")
let IRentalReservation = artifacts.require("./../RentalReservation/IRentalReservation.sol")

let RentalReservationFactoryProxyy = artifacts.require("./../RentalReservation/RentalReservationFactory/RentalReservationFactoryProxy.sol")
let RentalReservationFactory = artifacts.require("./../RentalReservation/RentalReservationFactory/RentalReservationFactory.sol")
let IRentalReservationFactory = artifacts.require("./../RentalReservation/RentalReservationFactory/IRentalReservationFactory.sol")

//const HotelReservationUpgrade = artifacts.require("./../TestContracts/HotelReservationUpgrade/HotelReservationUpgrade.sol");
//const IHotelReservationUpgrade = artifacts.require("./../TestContracts/HotelReservationUpgrade/IHotelReservationUpgrade.sol");

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const MintableToken = artifacts.require("./Tokens/MintableToken.sol");


//Rentals
const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const RentalProxy = artifacts.require('./Property/Rental/RentalProxy.sol');
const Rental = artifacts.require('./Property/Rental/Rental.sol');
const IRental = artifacts.require('./Property/Rental/IRental.sol');

const RentalUpgrade = artifacts.require('./TestContracts/RentalUpgrade/RentalUpgrade.sol');
const IRentalUpgrade = artifacts.require('./TestContracts/RentalUpgrade/IRentalUpgrade.sol');

const RentalFactoryProxy = artifacts.require('./Property/Rental/RentalFactory/RentalFactoryProxy.sol');
const RentalFactory = artifacts.require('./Property/Rental/RentalFactory/RentalFactory.sol');
const IRentalFactory = artifacts.require('./Property/Rental/RentalFactory/IRentalFactory.sol');

const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;
const currentTime = util.web3Now;
const timeTravel = util.timeTravel


contract('RentalReservation', function (accounts) {

	let rentalReservationContract;
	let reservationImpl;
	let rentalReservationFactory;
	let rentalReservationFactoryProxy;
	let rentalReservationFactoryImpl;

	let ERC20Instance;

	const _owner = accounts[0];
	const _notOwner = accounts[1];
	const customerAddress = accounts[2];
	const _marketplaceAdmin = accounts[2];
	const _rentalHost = accounts[3];
	let _rentalContractAddress;


	//Utils
	const day = 24 * 60 * 60;

	//Rentals
	let rentalContract;
	let rentalImpl;
	let rentalImpl2;

	let marketplaceProxy;
	let marketplaceImpl;
	let marketplaceContract;

	let factoryContract;
	let factoryProxy;
	let factoryImpl;

	const _marketplaceId = "ID123";
	const _url = "https://lockchain.co/marketplace";
	const _rentalAPI = "https://lockchain.co/RentalAPI";
	const _disputeAPI = "https://lockchain.co/DisuputeAPI";
	const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";
	const _deposit = '2000000000000000000'
	const _minNightsStay = '2'
	const _rentalTitle = 'Great Rental'
	const _rentalId = "testId123";
	const _defaultDailyRate = '1000000000000000';
	const _weekendRate = '20000000000000000';
	const _cleaningFee = '100000000000000000';
	const _refundPercentages = ['80'];
	const _daysBeforeStartForRefund = ['10'];
	const _rentalArrayIndex = 1;
	const _isInstantBooking = true;
	const _hostAddress = accounts[0]

	//Create reservation
	const rentalReservationId = "rentalReservationId123421"
	const checkInDate = currentTime(web3) + (day * 2);
	const checkOutDate = currentTime(web3) + (day * 5);
	const numberOfTravelers = "2"
	const rentalId = "rentalId"
	const reservationCostLOC = "100000000"
	let rentalIdHash


	const LOCAmount = '100000000000000000';
	describe("create new rental reservation", () => {

		beforeEach(async function () {

			factoryImpl = await RentalFactory.new();
			factoryProxy = await RentalFactoryProxy.new(factoryImpl.address);
			factoryContract = await IRentalFactory.at(factoryProxy.address);
			await factoryContract.init();

			marketplaceImpl = await Marketplace.new();
			marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
			marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

			rentalImpl = await Rental.new();
			await rentalImpl.init();

			await marketplaceContract.init();
			await marketplaceContract.setRentalFactoryContract(factoryContract.address);
			await factoryContract.setImplAddress(rentalImpl.address);
			await factoryContract.setMarketplaceAddress(marketplaceContract.address);

			await marketplaceContract.createMarketplace(
				_marketplaceId,
				_url,
				_rentalAPI,
				_disputeAPI,
				_exchangeContractAddress, {
					from: _marketplaceAdmin
				}
			);

			await marketplaceContract.approveMarketplace(
				_marketplaceId, {
					from: _owner
				}
			);

			await marketplaceContract.createRental(
				_rentalId,
				_marketplaceId,
				_defaultDailyRate,
				_weekendRate,
				_cleaningFee,
				_refundPercentages,
				_daysBeforeStartForRefund,
				_isInstantBooking,
				_deposit,
				_minNightsStay,
				_rentalTitle, {
					from: _rentalHost
				}
			);
			rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
			_rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId, _marketplaceId);
			console.log(_rentalContractAddress);
			rentalInsance = await IRental.at(_rentalContractAddress)


			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			let rentalReservation = await RentalReservation.new();

			await rentalReservation.init();

			rentalReservationFactoryImpl = await RentalReservationFactory.new();
			rentalReservationFactoryProxy = await RentalReservationFactoryProxyy.new(rentalReservationFactoryImpl.address);
			rentalReservationContract = await IRentalReservationFactory.at(rentalReservationFactoryProxy.address);

			await rentalReservationContract.init();
			await rentalReservationContract.setImplAddress(rentalReservation.address);
			await ERC20Instance.approve(rentalReservationContract.address, LOCAmount, {
				from: customerAddress
			});
			let tokenInstanceAddress = await rentalReservationContract.setLOCTokenContractAddress(ERC20Instance.address);
			let value = await rentalInsance.getReservationCost(checkInDate, '3');
			console.log(value.toString());

		})

		it("should create new Rental Reservation", async function () {

			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				checkInDate,
				checkOutDate,
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);
			console.log('test');
			let reservationCount = await rentalReservationContract.getRentalReservationsCount();
			assert.equal(reservationCount, 1, "The hotel reservation was not created properly");
		})
	})

})