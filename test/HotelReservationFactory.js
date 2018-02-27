const web3 = require("web3");

let HotelReservationProxy = artifacts.require("./../HotelReservation/HotelReservationProxy.sol");
let HotelReservation = artifacts.require("./../HotelReservation/HotelReservation.sol");
let IHotelReservation = artifacts.require("./../HotelReservation/IHotelReservation.sol");

let HotelReservationFactoryProxy = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactoryProxy.sol");
let HotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactory.sol");
let IHotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/IHotelReservationFactory.sol");

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");

const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;


contract('HotelReservationFactory', function (accounts) {

	let hotelReservationContract;
	let reservationImpl;

	let hotelReservationFactory;
	let hotelReservationFactoryProxy;
	let hotelReservationFactoryImpl;


	const _owner = accounts[0];
	const _notOwner = accounts[1];

	describe("create hotel reservation factory proxy", () => {
		beforeEach(async function () {

			hotelReservation = await HotelReservation.new();
			await hotelReservation.init();

			hotelReservationFactoryImpl = await HotelReservationFactory.new();
			hotelReservationFactoryProxy = await HotelReservationFactoryProxy.new(hotelReservationFactoryImpl.address);
			hotelReservationContract = await IHotelReservationFactory.at(hotelReservationFactoryProxy.address);

			await hotelReservationContract.init();
			await hotelReservationContract.setImplAddress(hotelReservation.address);
		});

		it("should get the owner of the first contract", async function () {
			const owner = await hotelReservationContract.getOwner();
			assert.strictEqual(owner, _owner, "The owner is not set correctly");
		});
	});

})