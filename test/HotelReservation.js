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


contract('HotelReservation', function (accounts) {

	let hotelReservationContract;
	let reservationImpl;

	let hotelReservationFactory;
	let hotelReservationFactoryProxy;
	let hotelReservationFactoryImpl;


	const _owner = accounts[0];
	const _notOwner = accounts[1];
	const hotelReservationId = "testId123";
	const custommerAddress = accounts[2];
	const reservationCostLOC = '1';
	const reservationStartDate = '1519689600';
	const reservationEndDate = '1519776000';
	const daysBeforeStartForRefund = '10';
	const refundPercantage = '20';
	const hotelId = "testId135";
	const roomId = "testId246";


	//For negative cases
	const pastDate = '1518652800'


	describe("create new hotel reservation", () => {

		beforeEach(async function () {

			hotelReservation = await HotelReservation.new();
			await hotelReservation.init();

			hotelReservationFactoryImpl = await HotelReservationFactory.new();
			hotelReservationFactoryProxy = await HotelReservationFactoryProxy.new(hotelReservationFactoryImpl.address);
			hotelReservationContract = await IHotelReservationFactory.at(hotelReservationFactoryProxy.address);

			await hotelReservationContract.init();
			await hotelReservationContract.setImplAddress(hotelReservation.address);

		});

		it("should create new Hotel Reservation", async function () {
			let result = await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				custommerAddress,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercantage,
				hotelId,
				roomId
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");
		});

		it("should emit two events when creating a new Hotel Reservation", async function () {
			const expectedEvent = 'LogCreateHotelReservation';
			let result = await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				custommerAddress,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercantage,
				hotelId,
				roomId
			);
			assert.lengthOf(result.logs, 2, "There should be 2 event emitted from creating new hotel reservation!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		});

		it("should throw if the start date is in the past ", async function () {

			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				custommerAddress,
				reservationCostLOC,
				pastDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercantage,
				hotelId,
				roomId
			));
		});

		it("should throw if the end date is before the start date", async function () {
			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				custommerAddress,
				reservationCostLOC,
				reservationStartDate,
				pastDate,
				daysBeforeStartForRefund,
				refundPercantage,
				hotelId,
				roomId
			));
		})
	})
})