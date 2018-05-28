const moment = require("moment");
const ethers = require("ethers");

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
	let rentalReservation

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
	const checkInDateToday = currentTime(web3);
	const checkOutDate = currentTime(web3) + (day * 5);
	const numberOfTravelers = "2"
	let rentalId = "rentalId"
	const reservationCostLOC = "100000000"
	let rentalIdHash

	//Negative
	let pastCheckInDate = currentTime(web3) - (day * 8);
	let newNumberOfTravelers = "4";


	const LOCAmount = '100000000000000000';
	let actualReservationCost;


	function removeNullBytes(stringactualReservationCost) {
		return stringactualReservationCost.replace(/\u0000/g, '')
	}

	function formatTimestamp(timestamp) {
		let result = moment.unix(timestamp).utc();
		result.set({
			h: 23,
			m: 59,
			s: 59
		});

		return result.unix();
	};

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
			rentalInstance = await IRental.at(_rentalContractAddress)
			rentalId = await rentalInstance.getRentalId();

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			rentalReservation = await RentalReservation.new();

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
			actualReservationCost = await rentalInstance.getReservationCost(checkInDate, '3');

		})

		it("should create new Rental Reservation", async function () {

			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);
			let reservationCount = await rentalReservationContract.getRentalReservationsCount();
			assert.equal(reservationCount, 1, "The hotel reservation was not created properly");
		})

		it("should create new Rental Reservation and set the correct parameters", async function () {
			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);

			let rentalReservationAddress = await rentalReservationContract.getRentalReservationContractAddress(rentalReservationId);
			let rentalReservationInstance = await RentalReservation.at(rentalReservationAddress);
			let result = await rentalReservationInstance.getRentalReservation();

			assert.equal(removeNullBytes(ethers.utils.toUtf8String(result[0])), rentalReservationId, "The reservation id was not set correctly");
			assert.strictEqual(result[1], customerAddress, "The customer address was not set correctly");
			assert.strictEqual(result[2].toString(), actualReservationCost.toString(), "The reservation cost was not set correctly");
			assert.strictEqual(result[3].toString(), (formatTimestamp(checkInDate)).toString(), "The check in date  was not set correctly");
			assert.strictEqual(result[4].toString(), (formatTimestamp(checkOutDate)).toString(), "The check out date was not set correctly");
			assert.strictEqual(result[5].toString(), numberOfTravelers, "The number of travelers was not set correctly");
			assert.isFalse(result[6], "Dispute open should be false ");
			assert.equal(result[7], rentalId, "The rental id was not set correctly");

		});

		it("should create new Rental reservation for today", async function () {
			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDateToday),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);
			let reservationCount = await rentalReservationContract.getRentalReservationsCount();
			assert.equal(reservationCount, 1, "The hotel reservation was not created properly");
		});

		it("should transfer tokens from the customer to the reservation contract when reservation is craeted", async function () {
			let initialCustomerBalance = await ERC20Instance.balanceOf(customerAddress);

			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);
			let rentalReservationAddress = await rentalReservationContract.getRentalReservationContractAddress(rentalReservationId);
			let rentalReservationInstance = await RentalReservation.at(rentalReservationAddress);

			let finalCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let finalContractBalance = await ERC20Instance.balanceOf(rentalReservationInstance.address);

			assert.equal(finalCustomerBalance.toString(), (initialCustomerBalance.minus(actualReservationCost)).toString(), "The transfer wasn't successful. Customer balance is not decreased");
			assert.equal(finalContractBalance.toString(), actualReservationCost.toString(), "The transfer wasn't successful. Contract balance is not increased");
		});

		it("should emit two events when creating a rental reservation", async function () {
			const expectedEvent = 'LogReservationCreated';

			let result = await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);
			assert.lengthOf(result.logs, 2, "There should be 2 event emitted from creating new hotel reservation!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The first event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
			assert.strictEqual(result.logs[1].event, expectedEvent, `The second event emitted was ${result.logs[1].event} instead of ${expectedEvent}`)
		});

		it("should throw if the start date is in the past", async function () {
			await expectThrow(rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(pastCheckInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			));
		});

		it("should throw if the end date is before the start date", async function () {
			await expectThrow(rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkInDateToday),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			));
		});

		it("should throw if the reservation id already exists", async function () {
			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);

			await expectThrow(rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			));
		})

		it("should throw if you try to update existing reservation", async function () {
			await rentalReservationContract.createRentalReservation(
				rentalReservationId,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				numberOfTravelers,
				_rentalContractAddress, {
					from: customerAddress
				}
			);

			let rentalReservationAddress = await rentalReservationContract.getRentalReservationContractAddress(rentalReservationId);
			let rentalReservationInstance = await RentalReservation.at(rentalReservationAddress);

			await expectThrow(rentalReservationInstance.createRentalReservation(
				rentalReservationId,
				customerAddress,
				formatTimestamp(checkInDate),
				formatTimestamp(checkOutDate),
				newNumberOfTravelers,
				rentalId,
				actualReservationCost, {
					from: customerAddress
				}
			));

		})
	})

})