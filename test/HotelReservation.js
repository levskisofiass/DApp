// const web3 = require("web3");
const moment = require("moment");

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
const currentTime = util.web3Now;
const timeTravel = util.timeTravel


contract('HotelReservation', function (accounts) {

	let hotelReservationContract;
	let reservationImpl;

	let hotelReservationFactory;
	let hotelReservationFactoryProxy;
	let hotelReservationFactoryImpl;

	let ERC20Instance;

	const _owner = accounts[0];
	const _notOwner = accounts[1];
	const withdrawerAddress = accounts[5];
	const withdrawalDestinationAddress = accounts[6];

	var currentTimestamp = Date.now() / 1000 | 0;
	const day = 24 * 60 * 60;

	const hotelReservationId = "testId123";
	const hotelReservationIdTwo = "testID456";
	const hotelReservationIdThree = "testID980";
	const customerAddress = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';
	// const customerAddress = accounts[3];
	const reservationCostLOC = '1000';
	const reservationStartDate = currentTimestamp + (day * 5);
	const reservationEndDate = currentTimestamp + (day * 8);
	const daysBeforeStartForRefund = '2';
	const refundPercentage = '20';
	const hotelId = "testId135";
	const roomId = "testId246";
	const LOCAmount = '10000';
	const newReservationCostLOC = '5';
	const numberOfTravelers = '4'
	const amountToRefund = (reservationCostLOC * refundPercentage) / 100;

	//For Cancelation
	const tomorrowStardDate = currentTimestamp + (day);
	const oneDayBeforeRefund = '1';
	const zeroDaysBeforeRefund = '0'
	const zeroRefundPercentage = '0';
	const fullRefund = '100';
	let locRemainder = reservationCostLOC - amountToRefund;

	//For negative cases
	const pastDate = '1518652800'
	const wrongRefundPercantage = '120'
	const wrongDatsForRefund = '10';
	const zeroAddress = '0x0000000000000000000000000000000000000000';

	//For withdraw
	let reservationStartDateTravel = currentTime(web3) + (day * 5)
	let reservationEndDateTravel = currentTime(web3) + (day * 8)
	let currentTimeStampTravel = currentTime(web3)
	let pastDateTravel = currentTime(web3) - (day * 8);


	function formatTimestamp(timestamp) {
		let result = moment.unix(timestamp).utc();
		result.set({
			h: 23,
			m: 59,
			s: 59
		});

		return result.unix();
	};


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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			console.log(reservationStartDateTravel);
			console.log(reservationEndDateTravel);
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");
		});

		it("should create new Hotel Reservation for today", async function () {

			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(pastDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(pastDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				wrongRefundPercantage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		});

		it("should throw if reservation is for today and the refund days are greater than 1", async function () {
			await expectThrow(hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(currentTimeStampTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				wrongRefundPercantage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			));
		})


	});

	describe("cancel hotel reservation", () => {
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

			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
		})

		it("should cancel the reservation properly", async function () {

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);
			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 0, "The hotel reservation was not canceled properly");
		});

		it("should transfer the amount to the customer", async function () {
			let initialCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let initialContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);
			let finalCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let finalContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);

			assert(finalCustomerBalance.eq(initialCustomerBalance.plus(amountToRefund)), "The cancelation wasn't successful. Customer balance is not increased");
			assert(finalContractBalance.eq(initialContractBalance - amountToRefund), "The cancelation wasn't successful. Contract balance is not decreased");
		});

		it("should cancel the reservation with refund 100%", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				fullRefund,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			let initialCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let initialContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);
			let finalCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let finalContractBalance = await ERC20Instance.balanceOf(hotelReservationContract.address);

			assert(finalCustomerBalance.eq(initialCustomerBalance.plus(amountToRefund)), "The cancelation wasn't successful. Customer balance is not increased");
			assert(finalContractBalance.eq(initialContractBalance - amountToRefund), "The cancelation wasn't successful. Contract balance is not decreased");
		})

		it("should make the resevation address equl to zero if the cancelation is successful", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationIdTwo, {
					from: customerAddress
				}
			);

			let hotelReservationAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo);
			assert.equal(hotelReservationAddress, zeroAddress, "The hotel reservation address was not unlinked ");
		})

		it("should cancel the reservation if the current timesstamp is equal to the refund date ", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				zeroDaysBeforeRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationIdTwo, {
					from: customerAddress
				}
			);

			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not canceled properly");
		});

		it("should cancel the reservation if the current timesstamp is today ", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(currentTimeStampTravel),
				formatTimestamp(reservationEndDateTravel),
				zeroDaysBeforeRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationIdTwo, {
					from: customerAddress
				}
			);

			let reservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not canceled properly");
		});

		it("should increase the loc remainder amount after cancelation", async function () {
			let initialRemainder = await hotelReservationContract.getLocRemainderAmount();
			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);

			let finalRemainder = await hotelReservationContract.getLocRemainderAmount();
			assert(finalRemainder.eq(initialRemainder + locRemainder), "The ramainder wasn't increased properly");

		});

		it("should increase the loc remainder amount twice after cancelation", async function () {
			let initialRemainder = await hotelReservationContract.getLocRemainderAmount();

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);

			let finalRemainder = await hotelReservationContract.getLocRemainderAmount();


			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			let intermediateRemainder = await hotelReservationContract.getLocRemainderAmount();

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationIdTwo, {
					from: customerAddress
				}
			);

			let totalRemainder = await hotelReservationContract.getLocRemainderAmount();
			assert(finalRemainder.eq(initialRemainder + locRemainder), "The ramainder wasn't increased properly first time");
			assert(totalRemainder.eq(intermediateRemainder.plus(locRemainder)), "The ramainder wasn't increased properly second time");
		});


		it("should emit one event if the cancelation is successful", async function () {
			let expectedEvent = "LogCancelHotelReservation";

			let result = await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);
			assert.lengthOf(result.logs, 1, "There should be 1 event emitted from canceling the hotel reservation!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		});


		it("should throw if the refund percentage is not greater than zero", async function () {

			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				zeroRefundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);
			await expectThrow(hotelReservationContract.cancelHotelReservation(
				hotelReservationIdTwo, {
					from: customerAddress
				}
			));
		});

		it("should throw if person different from the customer tries to cancel the reservation", async function () {
			await expectThrow(hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: _owner
				}
			));
		});

		it("should throw if customer tries to cancel already canceled reservation", async function () {
			await hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			);
			await expectThrow(hotelReservationContract.cancelHotelReservation(
				hotelReservationId, {
					from: customerAddress
				}
			));
		})
	})

	describe("withdraw", () => {
		beforeEach(async function () {

			reservationStartDateTravel = currentTime(web3) + (day * 5);
			reservationEndDateTravel = currentTime(web3) + (day * 8);

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

			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.createHotelReservation(
				hotelReservationIdTwo,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.setWithdrawerAddress(withdrawerAddress, {
				from: _owner
			});
			await hotelReservationContract.setWithdrawDestinationAddress(withdrawalDestinationAddress, {
				from: _owner
			});

			await hotelReservationContract.setCyclesCount(50);

		})

		it("should withdraw the money to the wallet destination", async function () {
			let destinationAddressInitBalance = await ERC20Instance.balanceOf(withdrawalDestinationAddress);
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);

			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)

			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			await hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			})

			let destinationAddressFinalBalance = await ERC20Instance.balanceOf(withdrawalDestinationAddress);
			assert(destinationAddressFinalBalance.eq(destinationAddressInitBalance.plus(reservationCostLOC * 2)), "The withdraw wasnt' correct");

		});

		it("should withdraw the money and the remainder  to the wallet destination", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationIdThree,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
				daysBeforeStartForRefund,
				refundPercentage,
				hotelId,
				roomId,
				numberOfTravelers, {
					from: customerAddress
				}
			);

			await hotelReservationContract.cancelHotelReservation(
				hotelReservationIdThree, {
					from: customerAddress
				}
			);

			let destinationAddressInitBalance = await ERC20Instance.balanceOf(withdrawalDestinationAddress);
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);

			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)

			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			await hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			})
			let destinationAddressFinalBalance = await ERC20Instance.balanceOf(withdrawalDestinationAddress);
			assert(destinationAddressFinalBalance.eq(destinationAddressInitBalance.plus((reservationCostLOC * 2) + locRemainder)), "The withdraw wasnt' correct");

		});

		it("should make the reservation inactive after the withdrawal and remove it from the reservation array", async function () {
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);
			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)


			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			await hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			})
			let finalReservationsCount = await hotelReservationContract.getHotelReservationsCount();
			assert.equal(finalReservationsCount, 0, "The reservations were not unlinked");
		})

		it("should emit events for every reservation when the withdraw is successful", async function () {
			const expectedEvent = 'LogWithdrawal';
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);

			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)

			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			let result = await hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			})
			assert.lengthOf(result.logs, hotelReservations.length, "There should be 1 event emitted from withdraw !");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		})

		it("should throw if the persno other than the withdrawer wants to withdraw", async function () {
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);

			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)


			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			await expectThrow(hotelReservationContract.withdraw(hotelReservations, {
				from: _owner
			}))
		});

		it("should throw if the reservation is inactive", async function () {
			let futureDays = (day * 10)
			await timeTravel(web3, futureDays);
			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)


			let hotelReservations = [reservationOneAddress, reservationTwoAddress];
			await hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			})
			await expectThrow(hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			}))
		});

		it("should throw if the end date of the raservation haven't passed", async function () {
			let reservationOneAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationId);
			let reservationTwoAddress = await hotelReservationContract.getHotelReservationContractAddress(hotelReservationIdTwo)


			let hotelReservations = [reservationOneAddress, reservationTwoAddress];

			await expectThrow(hotelReservationContract.withdraw(hotelReservations, {
				from: withdrawerAddress
			}))
		});

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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
			assert.equal(reservationsCount, 1, "The hotel reservation count is not correct");
		});

		it("should change hotel reservation implementation and add new function", async function () {
			await hotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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
				formatTimestamp(reservationStartDateTravel),
				formatTimestamp(reservationEndDateTravel),
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