const web3 = require("web3");

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

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;

contract('Rental', function (accounts) {
  let rentalContract;
  let rentalImpl;
  let rentalImpl2;

  let marketplaceProxy;
  let marketplaceImpl;
  let marketplaceContract;

  let factoryContract;
  let factoryProxy;
  let factoryImpl;

  const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _marketplaceAdmin = accounts[2];
  const _rentalHost = accounts[3];
  const _rentalHostUpdate = accounts[4];

  const _rentalId = "testId123";
  const _rentalId2 = "testId223";
  const _marketplaceId = "ID123";
  const _marketplaceIdUpdate = "ID1234";
  const _defaultDailyRate = '1000000000000000000';
  const _defaultDailyRateUpdate = '2000000000000000000';
  const _nonWorkingDayPriceUpdate = '3000000000000000000';
  const _nonWorkingDayPrice = '2000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _cleaningFeeUpdate = '400000000000000000';
  const _cleaningFee2 = '200000000000000000';
  const _refundPercent = '80';
  const _refundPercentUpdate = '50';
  const _daysBeforeStartForRefund = '10';
  const _daysBeforeStartForRefundUpdate = '5';
  const _arrayIndex = 1;
  const _isInstantBooking = true;
  const _isInstantBookingUpdate = false;

  const _url = "https://lockchain.co/marketplace";
  const _rentalAPI = "https://lockchain.co/RentalAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

  describe("create new rental", () => {
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
    });

    it("should create new Rental from Marketplace contract and Rental factory contract", async () => {
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );
      let rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");
    });

    it("should throw on creating second rental in same contract", async () => {
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );

      const rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId);

      let rentalContract = await IRental.at(rentalContractAddress);
      await expectThrow(rentalContract.createRental(
        _rentalId2,
        _marketplaceId,
        _rentalHost,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _arrayIndex,
        _isInstantBooking,
        factoryContract.address, {
          from: _rentalHost
        }
      ));
    });

    it("should throw on creating rental with empty rentalId", async () => {
      await expectThrow(marketplaceContract.createRental(
        "",
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      ));
    });
  });

  describe("update rental", () => {
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
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );

      let rentalAddress = await factoryContract.getRentalContractAddress(_rentalId);
      rentalContract = await IRental.at(rentalAddress);

    });

    it("should update rental", async function () {
      let result = await rentalContract.updateRental(
        _rentalId,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The Rental updating was not successful");
    });

    it("should update the values in a rental correctly", async function () {
      await rentalContract.updateRental(
        _rentalId,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHost
        }
      );

      let result = await rentalContract.getRental();
      assert.strictEqual(result[1].toString(), _rentalHostUpdate, "The Host was not update correctly")
      assert.strictEqual(web3.utils.hexToUtf8(result[2]), _marketplaceIdUpdate, "The marketplaceId was not update correctly")
      assert.strictEqual(result[3].toString(), _defaultDailyRateUpdate, "The workingDayPrice was not update correctly");
      assert.strictEqual(result[4].toString(), _nonWorkingDayPriceUpdate, "The nonWorkingDayPrice was not update correctly");
      assert.strictEqual(result[5].toString(), _cleaningFeeUpdate, "The cleaningFee was not update correctly");
      assert.strictEqual(result[6].toString(), _refundPercentUpdate, "The refundPercent was not update correctly");
      assert.strictEqual(result[7].toString(), _daysBeforeStartForRefundUpdate, "The daysBeforeStartForRefund was not update correctly");
      assert.isFalse(result[9], "The isInstantBooking was not update correctly");
    });

    it("should throw if trying to update rental with empty rentalId", async function () {
      await expectThrow(rentalContract.updateRental(
        "",
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHost
        }));
    });

    it("should throw if trying to update rental with wrong rentalId", async function () {
      await expectThrow(rentalContract.updateRental(
        _rentalId2,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHost
        }));
    });

    it("should throw if trying to update rental with empty new host address", async function () {
      await expectThrow(rentalContract.updateRental(
        _rentalId,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        "", {
          from: _rentalHost
        }));
    });

    it("should throw if non-host is trying to update rental", async function () {
      await expectThrow(rentalContract.updateRental(
        _rentalId,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHostUpdate
        }));
    });

    it("should emit event on rental update", async function () {
      const expectedEvent = 'LogUpdateRental';
      let result = await rentalContract.updateRental(
        _rentalId,
        _marketplaceIdUpdate,
        _defaultDailyRateUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _rentalHostUpdate, {
          from: _rentalHost
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Rental updation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("set different price for specific date for rental", () => {
    let anotherDayinSecunds = 1 * 24 * 60 * 1000;
    let randomDay = 2 * 24 * 60;
    let maxPeriodDays = 30 * 24 * 60;
    let closeOfMaxBookingDays = 60 * 24 * 60;
    let price = 2000000000000000000;
    let timestampStart;
    let timestampEnd;
    let rentalContractAddress;
    let rentalContract;

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
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );

      await factoryContract.setMaxBookingPeriod(maxPeriodDays * 1000);
      timestampStart = await getFutureTimestamp(randomDay);
      timestampEnd = await getFutureTimestamp(maxPeriodDays);
      rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId);
      rentalContract = await IRental.at(rentalContractAddress);
    });

    it("should set different price rental for some days", async () => {
      await rentalContract.setPrice(
        timestampStart,
        timestampEnd,
        price, {
          from: _rentalHost
        }
      );

      for (let day = timestampStart; day <= timestampEnd;
        (day += 86400)) {
        amount = await rentalContract.getPrice(day);
        assert(amount.eq(price), "The price was not correct set in " + day + " day");
      }
    });

    it("should set different price rental for one day", async () => {
      await rentalContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _rentalHost
        }
      );

      amount = await rentalContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in " + timestampStart + " day");
    });


    it("should set different price rental for two days", async () => {
      await rentalContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _rentalHost
        }
      );

      await rentalContract.setPrice(
        timestampEnd,
        timestampEnd,
        price, {
          from: _rentalHost
        }
      );

      amount = await rentalContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in startday");

      amount = await rentalContract.getPrice(timestampEnd);
      assert(amount.eq(price), "The price was not correct set in endday");
    });

    it("should set different price rental for one day and for another day should be the default price", async () => {
      await rentalContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _rentalHost
        }
      );

      amount = await rentalContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in startday");

      amount = await rentalContract.getPrice(timestampEnd);
      assert(amount.eq(_defaultDailyRate), "The price was not correct in endday");
    });

    it("should throw when non-host trying to set price", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampEnd,
          timestampStart,
          price, {
            from: _rentalHostUpdate
          }
        )
      );
    });

    it("should throw on endDay < startDay", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampEnd,
          timestampStart,
          price, {
            from: _rentalHost
          }
        )
      );
    });

    it("should throw on startDay < now", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampStart - (86400 * 4),
          timestampEnd,
          price, {
            from: _rentalHost
          }
        )
      );
    });

    it("should throw on endDay < now", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampStart,
          timestampStart - (86400 * 4),
          price, {
            from: _rentalHost
          }
        )
      );
    });

    it("should throw on price < 0", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampStart,
          timestampEnd,
          0, {
            from: _rentalHost
          }
        )
      );
    });

    it("should throw on interval pricing > max booking days interval", async () => {
      await expectThrow(
        rentalContract.setPrice(
          timestampStart,
          closeOfMaxBookingDays,
          price, {
            from: _rentalHost
          }
        )
      );
    });

    it("should throw on get price with timestamp = 0", async () => {
      await expectThrow(
        rentalContract.getPrice(0)
      );
    });
  });

  describe("upgrade rental contract", () => {
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
    });

    it("should change rental implementation and keep storage", async () => {
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );
      let rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");

      rentalImpl = await Rental.new();
      await rentalImpl.init();

      await factoryContract.setImplAddress(rentalImpl.address);

      rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");
    });

    it("should change rental implementation and add new function", async () => {
      await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );
      let rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");

      rentalImpl2 = await RentalUpgrade.new();
      await rentalImpl2.init();

      await factoryContract.setImplAddress(rentalImpl2.address);
      let rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId);
      let rentalContract = IRentalUpgrade.at(rentalContractAddress);

      await rentalContract.updateCleaningFee(_cleaningFee2);
      let result = await rentalContract.getRental();

      assert.strictEqual(result[5].toString(), _cleaningFee2, "The cleaningFee was not set correctly");

      rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");
    });

    it("should throw when using new function without upgrade", async () => {
      await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _rentalHost
        }
      );
      let rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(1), "The rentals count was not correct");

      let rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId);
      let rentalContract = IRentalUpgrade.at(rentalContractAddress);

      await expectThrow(rentalContract.updateCleaningFee(_cleaningFee2));
    });
  });
});