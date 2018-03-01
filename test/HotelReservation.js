const web3 = require("web3");

let HotelReservationProxy = artifacts.require("./../HotelReservation/HotelReservationProxy.sol");
let HotelReservation = artifacts.require("./../HotelReservation/HotelReservation.sol");
let IHotelReservation = artifacts.require("./../HotelReservation/IHotelReservation.sol");

let HotelReservationFactoryProxy = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactoryProxy.sol");
let HotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactory.sol");
let IHotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/IHotelReservationFactory.sol");

const HotelReservationUpgrade = artifacts.require("./../TestContracts/HotelReservationUpgrade/HotelReservationUpgrade.sol");
const IHotelReservationUpgrade = artifacts.require("./../TestContracts/HotelReservationUpgrade/IHotelReservationUpgrade.sol");

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const MintableToken = artifacts.require("./Tokens/MintableToken.sol");

const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;


contract('HotelReservation', function (accounts) {

	let hotelReservationContract;
	let reservationImpl;

	let hotelReservationFactory;
	let hotelReservationFactoryProxy;
	let hotelReservationFactoryImpl;

	let ERC20Instance;

	const _owner = accounts[0];
	const _notOwner = accounts[1];

	var currentTimestamp = Date.now() / 1000 | 0;
	const day = 24 * 60 * 60;

	const hotelReservationId = "testId123";
	const customerAddress = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';
	const reservationCostLOC = '1';
	const reservationStartDate = currentTimestamp + day;
	const reservationEndDate = currentTimestamp + (day * 3);
	const daysBeforeStartForRefund = '10';
	const refundPercentage = '20';
	const hotelId = "testId135";
	const roomId = "testId246";
	const LOCAmount = '1000';
	const newReservationCostLOC = '5';
	const numberOfTravelers = '4'
	const wrongRefundPercantage = '120'



	//For negative cases
	const pastDate = '1518652800'


	describe("create new hotel reservation", () => {

		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});


			hotelReservation = await HotelReservation.new();
			await hotelReservation.init();

			hotelReservationFactoryImpl = await HotelReservationFactory.new();
			hotelReservationFactoryProxy = await HotelReservationFactoryProxy.new(hotelReservationFactoryImpl.address);
			hotelReservationContract = await IHotelReservationFactory.at(hotelReservationFactoryProxy.address);

			await hotelReservationContract.init();
			await hotelReservationContract.setImplAddress(hotelReservation.address);

			await ERC20Instance.approve(hotelReservationContract.address, LOCAmount, {
				from: customerAddress
			});
			let tokenInstanceAddress = await hotelReservationContract.setLOCTokenContractAddress(ERC20Instance.address);

		});

		it("should create new Hotel Reservation", async function () {

			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");
		});

		it("should transfer tokens from the customer to the owner when valid reservation is created", async function () {
			let initialCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let initialContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);

			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let finalCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let finalContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);
			assert.equal(finalCustomerBalance.toString(), initialCustomerBalance.toString() - reservationCostLOC, "The transfer wasn't successful. Customer balance is not decreased");
			assert.equal(finalContractBalance.toString(), initialContractBalance.plus(reservationCostLOC), "The transfer wasn't successful. Contract balance is not increased");
		});

		it("should emit two events when creating a new Hotel Reservation", async function () {
			const expectedEvent = 'LogCreateHotelReservation';
			let result = await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			assert.lengthOf(result.logs, 2, "There should be 2 event emitted from creating new hotel reservation!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		});

		it("should throw if the start date is in the past ", async function () {

			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				pastDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		});

		it("should throw if the end date is before the start date", async function () {
			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				pastDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		})
		it("should throw if the reservation Id already exists", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				pastDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		});

		it("should throw if the refund percantage is greater than 100%", async function () {
			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				pastDate,
				daysBeforeStartForRefund,
				wrongRefundPercantage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		})
	})


	describe("upgrade hotel reservation contract", () => {
		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});


			hotelReservation = await HotelReservation.new();
			await hotelReservation.init();

			hotelReservationFactoryImpl = await HotelReservationFactory.new();
			hotelReservationFactoryProxy = await HotelReservationFactoryProxy.new(hotelReservationFactoryImpl.address);
			hotelReservationContract = await IHotelReservationFactory.at(hotelReservationFactoryProxy.address);

			await hotelReservationContract.init();
			await hotelReservationContract.setImplAddress(hotelReservation.address);

			await ERC20Instance.approve(hotelReservationContract.address, LOCAmount, {
				from: customerAddress
			});
			let tokenInstanceAddress = await hotelReservationContract.setLOCTokenContractAddress(ERC20Instance.address);

		});

		it("should change hotel reservation implementation and keep storage", async function () {
			let result = await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");

			hotelReservation = await HotelReservation.new();
			await hotelReservation.init();
			await hotelReservationContract.setImplAddress(hotelReservation.address);

			reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			1
			assert.equal(reservationsCount, 1, "The hotel reservation count is not correct");
		});

		it("should change hotel reservation implementation and add new function", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");

			hotelReservationUpgraded = await HotelReservationUpgrade.new();
			await hotelReservationUpgraded.init();

			await hotelReservationContract.setImplAddress(hotelReservationUpgraded.address);
			let hotelReservationContractAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let hotelReservationContractUpgrade = IHotelReservationUpgrade.at(hotelReservationContractAddress);


			await hotelReservationContractUpgrade.updateReservationCostLOC(newReservationCostLOC);
			let result = await hotelReservationContractUpgrade.getHotelReservation();

			assert.strictEqual(result[2].toString(), newReservationCostLOC, "The new cost for hotel reservation was not set correctly");

			reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");

		});

		it("should throw when using new function without upgrade", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				reservationStartDate,
				reservationEndDate,
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");

			let hotelReservationContractAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let hotelReservationContractUpgrade = IHotelReservationUpgrade.at(hotelReservationContractAddress);

			await expectThrow(hotelReservationContractUpgrade.updateReservationCostLOC(newReservationCostLOC));
		});
	})
})