const ethers = require("ethers");
const moment = require("moment");
const MintableToken = artifacts.require("./Tokens/MintableToken.sol");
let SimpleHotelReservation = artifacts.require("./../HotelReservation/SimpleHotelReservation.sol");

const util = require('./util');
const expectThrow = util.expectThrow;
const currentTime = util.web3Now;
const timeTravel = util.timeTravel


contract('SimpleHotelReservation', function (accounts) {

	let simpleHotelReservationContract;
	let ERC20Instance;

	const _owner = accounts[0];
	const _notOwner = accounts[1];
	const customerAddress = accounts[2];
	const recipientAddress = accounts[3];
	const reservationCostLOC = '100000000000000000';
	const LOCAmount = '4000000000000000000000';

	const newReservationCostLOC = '10';

	var currentTimestamp = Date.now() / 1000 | 0;
	const day = 24 * 60 * 60;
	const hotelReservationId = "testId123";
	const hotelReservationId2 = "daihdahdqhdohqohdqhdhqodhoqhdq";
	let maxAllowedCyclesCount = '50';

	let reservationWithdrawDate = currentTime(web3) + (day * 10)
	let futureWithdrawDate = currentTime(web3) + (day * 20);

	function formatTimestamp(timestamp) {
		let result = moment.unix(timestamp).utc();
		result.set({
			h: 23,
			m: 59,
			s: 59
		});

		return result.unix();
	};

	describe("create new simple hotel reservation", () => {

		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			simpleHotelReservationContract = await SimpleHotelReservation.new();
			await ERC20Instance.approve(simpleHotelReservationContract.address, LOCAmount, {
				from: customerAddress
			});

			let tokenInstanceAddress = await simpleHotelReservationContract.setLOCTokenContractAddress(ERC20Instance.address);
			let results = await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId2,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
		});

		xit("should create new simple hotel reservation", async function () {

			let results = await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
			let reservationsCount = await simpleHotelReservationContract.getHotelReservationsCount();
			assert.equal(reservationsCount, 1, "The hotel reservation was not created properly");
		});

		it("should create new simple hotel reservation and set the correct values to the mapping", async function () {
			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
			const reservationInfo = await simpleHotelReservationContract.hotelReservations(hotelReservationId);
			assert.equal(reservationInfo[0], recipientAddress, "The recipient address is not correct");
			assert.equal(reservationInfo[1].toString(), reservationCostLOC, "The reservation cost is not correct");
			assert.equal(reservationInfo[2].toString(), formatTimestamp(reservationWithdrawDate), "The withdraw date is not correct");

		});

		it("should transfer tokens from the customer to the owner when valid reservation is created", async function () {
			let initialCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let initialContractBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);

			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
			let finalCustomerBalance = await ERC20Instance.balanceOf(customerAddress);
			let finalContractBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			assert.equal(finalCustomerBalance.toString(), initialCustomerBalance.toString() - reservationCostLOC, "The transfer wasn't successful. Customer balance is not decreased");
			assert.equal(finalContractBalance.toString(), initialContractBalance.plus(reservationCostLOC), "The transfer wasn't successful. Contract balance is not increased");
		});

		it("should emit one event when creating a new Simple Hotel Reservation", async function () {
			const expectedEvent = 'LogCreateHotelReservation';

			let result = await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
			assert.lengthOf(result.logs, 1, "There should be 1 event emitted from creating new hotel reservation!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		});

		it("should throw if the reservation id already exists", async function () {
			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);

			await expectThrow(simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			));
		})

		it("should throw if you try to update existing reservation", async function () {
			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);

			await expectThrow(simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				newReservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			));

		})

		it("should throw if the reservation cost is not greater than 0", async function () {
			await expectThrow(simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				"0",
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			));
		});

		it("should throw if there is no approval for the address", async function () {
			await expectThrow(simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				newReservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: recipientAddress
				}
			));
		})
	})

	describe("set loc token address", () => {
		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			simpleHotelReservationContract = await SimpleHotelReservation.new();
			await ERC20Instance.approve(simpleHotelReservationContract.address, LOCAmount, {
				from: customerAddress
			});

		});

		it("should set the address correctly", async function () {
			await simpleHotelReservationContract.setLOCTokenContractAddress(ERC20Instance.address);
			let tokenInstanceAddress = await simpleHotelReservationContract.LOCTokenContract.call();

			assert.equal(tokenInstanceAddress, ERC20Instance.address, "The LocToken address was not set correctly");

		});

		it("should throw if not owner tries to set the loc token address", async function () {
			await expectThrow(simpleHotelReservationContract.setLOCTokenContractAddress(
				ERC20Instance.address, {
					from: recipientAddress
				}
			));
		});

	});
	describe("set max allowed cycles count", () => {
		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			simpleHotelReservationContract = await SimpleHotelReservation.new();
			await simpleHotelReservationContract.setmaxAllowedWithdrawCyclesCount(maxAllowedCyclesCount);
		});

		it("should set the max allowed cycles count correctly", async function () {
			maxAllowedCyclesCount = "30";
			await simpleHotelReservationContract.setmaxAllowedWithdrawCyclesCount(maxAllowedCyclesCount);
			let cyclesCount = await simpleHotelReservationContract.getmaxAllowedWithdrawCyclesCount();

			assert.equal(maxAllowedCyclesCount, cyclesCount, "The max allowed cycles count were not set correctly");

		});

		it("should throw if not owner tries to set the loc token address", async function () {
			await expectThrow(simpleHotelReservationContract.setmaxAllowedWithdrawCyclesCount(
				maxAllowedCyclesCount, {
					from: recipientAddress
				}
			));
		});

		it("should get the max allowed cycles count", async function () {
			let cyclesCount = await simpleHotelReservationContract.getmaxAllowedWithdrawCyclesCount();
			assert.equal(maxAllowedCyclesCount, cyclesCount, "The max allowed cycles count were not set correctly");
		})
	});

	describe("withdraw reservations", () => {

		beforeEach(async function () {

			ERC20Instance = await MintableToken.new({
				from: _owner
			});
			await ERC20Instance.mint(customerAddress, LOCAmount, {
				from: _owner
			});

			await ERC20Instance.mint(recipientAddress, LOCAmount, {
				from: _owner
			});

			simpleHotelReservationContract = await SimpleHotelReservation.new();
			await ERC20Instance.approve(simpleHotelReservationContract.address, LOCAmount, {
				from: customerAddress
			});

			await ERC20Instance.approve(simpleHotelReservationContract.address, LOCAmount, {
				from: recipientAddress
			});

			let tokenInstanceAddress = await simpleHotelReservationContract.setLOCTokenContractAddress(ERC20Instance.address);
			await simpleHotelReservationContract.setmaxAllowedWithdrawCyclesCount(maxAllowedCyclesCount);
			let results = await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				recipientAddress, {
					from: customerAddress
				}
			);
		})

		it("should withdraw the reservation and transfer the amount to the host", async function () {
			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);

			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			let hotelReservations = [hotelReservationId];
			await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: recipientAddress
			})

			let contractFinalBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostFinalBalance = await ERC20Instance.balanceOf(recipientAddress);

			assert(hostFinalBalance.eq(hostInitialBalance.plus(reservationCostLOC)), "The withdraw wasn't correct, host balance is not increased");
			assert(contractFinalBalance.eq(contractInitialBalance.sub(reservationCostLOC)), "The withdraw wasn't correct, contract balance is not decreased")
		})

		it("should withdraw only the tokens for the senders reservations", async function () {
			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId2,
				reservationCostLOC,
				formatTimestamp(reservationWithdrawDate),
				customerAddress, {
					from: customerAddress
				}
			);
			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);

			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			let hotelReservations = [hotelReservationId];
			await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: recipientAddress
			})

			let contractFinalBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostFinalBalance = await ERC20Instance.balanceOf(recipientAddress);

			assert(hostFinalBalance.eq(hostInitialBalance.plus(reservationCostLOC)), "The withdraw wasn't correct, host balance is not increased");
			assert(contractFinalBalance.eq(contractInitialBalance.sub(reservationCostLOC)), "The withdraw wasn't correct, contract balance is not decreased")
		})

		it("should withdraw from many reservations", async function () {
			let hotelReservations = [];
			for (i = 1; i < 30; i++) {
				let reservationId = i.toString() + "a";
				await simpleHotelReservationContract.createHotelReservation(
					reservationId,
					reservationCostLOC,
					formatTimestamp(reservationWithdrawDate),
					recipientAddress, {
						from: customerAddress
					}
				);
				hotelReservations.push(reservationId);
			}

			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);
			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: recipientAddress
			})

			let contractFinalBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostFinalBalance = await ERC20Instance.balanceOf(recipientAddress);
			assert(hostFinalBalance.eq(hostInitialBalance.plus(reservationCostLOC * 29)), "The withdraw wasn't correct, host balance is not increased");
			assert(contractFinalBalance.eq(contractInitialBalance.sub(reservationCostLOC * 29)), "The withdraw wasn't correct, contract balance is not decreased")

		})

		it("should withdraw only reservations with withdraw date in the past", async function () {
			await simpleHotelReservationContract.createHotelReservation(
				hotelReservationId2,
				reservationCostLOC,
				formatTimestamp(futureWithdrawDate),
				customerAddress, {
					from: customerAddress
				}
			);
			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);

			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			let hotelReservations = [hotelReservationId, hotelReservationId2];
			await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: recipientAddress
			})

			let contractFinalBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostFinalBalance = await ERC20Instance.balanceOf(recipientAddress);

			assert(hostFinalBalance.eq(hostInitialBalance.plus(reservationCostLOC)), "The withdraw wasn't correct, host balance is not increased");
			assert(contractFinalBalance.eq(contractInitialBalance.sub(reservationCostLOC)), "The withdraw wasn't correct, contract balance is not decreased")
		})

		it("should not withdraw if the sender is not equal to the recipient address", async function () {
			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);

			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			let hotelReservations = [hotelReservationId];
			await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: customerAddress
			})

			let contractFinalBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostFinalBalance = await ERC20Instance.balanceOf(recipientAddress);

			assert(hostFinalBalance.eq(hostInitialBalance), "The withdraw wasn't correct, host balance different");
			assert(contractFinalBalance.eq(contractInitialBalance), "The withdraw wasn't correct, contract balance different");
		})

		it("should emit 1 event when the withdraw is successful", async function () {
			const expectedEvent = 'LogWithdrawal';
			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			let hotelReservations = [hotelReservationId];
			let result = await simpleHotelReservationContract.withdraw(hotelReservations, {
				from: customerAddress
			})
			assert.lengthOf(result.logs, hotelReservations.length, "There should be 1 event emitted from withdraw !");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);

		})

		it("should throw if the reservations array is bigger than the cycles count", async function () {
			await simpleHotelReservationContract.setmaxAllowedWithdrawCyclesCount("5");
			let hotelReservations = [];
			for (i = 1; i < 30; i++) {
				let reservationId = i.toString() + "a";
				await simpleHotelReservationContract.createHotelReservation(
					reservationId,
					reservationCostLOC,
					formatTimestamp(reservationWithdrawDate),
					recipientAddress, {
						from: customerAddress
					}
				);
				hotelReservations.push(reservationId);
			}

			let contractInitialBalance = await ERC20Instance.balanceOf(simpleHotelReservationContract.address);
			let hostInitialBalance = await ERC20Instance.balanceOf(recipientAddress);
			let futureDays = (day * 15)
			await timeTravel(web3, futureDays);

			await expectThrow(simpleHotelReservationContract.withdraw(hotelReservations, {
				from: recipientAddress
			}));
		})
	})
})