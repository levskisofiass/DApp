const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyProxy = artifacts.require('./Property/PropertyProxy.sol')
const Property = artifacts.require('./Property/Property.sol')
const IProperty = artifacts.require('./Property/IProperty.sol')

const PropertyUpgrade = artifacts.require('./TestContracts/PropertyUpgrade/PropertyUpgrade.sol')
const IPropertyUpgrade = artifacts.require('./TestContracts/PropertyUpgrade/IPropertyUpgrade.sol')

const PropertyFactoryProxy = artifacts.require('./Property/PropertyFactory/PropertyFactoryProxy.sol')
const PropertyFactory = artifacts.require('./Property/PropertyFactory/PropertyFactory.sol')
const IPropertyFactory = artifacts.require('./Property/PropertyFactory/IPropertyFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;

contract('Property', function (accounts) {
  let propertyContract;
  let propertyProxy;
  let propertyImpl;
  let propertyImpl2;

  let marketplaceProxy;
  let marketplaceImpl;
  let marketplaceContract;

  let factoryContract;
  let factoryProxy;
  let factoryImpl;

  const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _marketplaceAdmin = accounts[2];
  const _propertyHost = accounts[3];
  const _propertyHostUpdate = accounts[4];

  const _propertyId = "testId123";
  const _propertyId2 = "testId223";
  const _marketplaceId = "ID123";
  const _marketplaceIdUpdate = "ID1234";
  const _workingDayPrice = '1000000000000000000';
  const _workingDayPriceUpdate = '2000000000000000000';
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
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

  xdescribe("create new property", () => {
    beforeEach(async function () {
      factoryImpl = await PropertyFactory.new();
      factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
      factoryContract = await IPropertyFactory.at(factoryProxy.address);
      await factoryContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      await propertyImpl.init();

      await marketplaceContract.init(factoryContract.address);
      await factoryContract.setPropertyImplAddress(propertyImpl.address);
      await factoryContract.setMarketplaceAddress(marketplaceContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
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

    it("should create new Property from Marketplace contract and Property factory contract", async() => {
      let result = await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );
      let propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");
    });

    it("should throw on creating second property in same contract", async() => {
      let result = await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );

      const propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);

      let propertyContract = await IProperty.at(propertyContractAddress);
      await expectThrow(propertyContract.createProperty(
        _propertyId2,
        _marketplaceId,
        _propertyHost,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _arrayIndex,
        _isInstantBooking,
        factoryContract.address, {
          from: _propertyHost
        }
      ));
    });

    it("should throw on creating property with empty propertyId", async() => {
      await expectThrow(marketplaceContract.createProperty(
        "",
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      ));
    });
  });

  xdescribe("update property", () => {
    beforeEach(async function () {
      factoryImpl = await PropertyFactory.new();
      factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
      factoryContract = await IPropertyFactory.at(factoryProxy.address);
      await factoryContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      await propertyImpl.init();

      await marketplaceContract.init(factoryContract.address);
      await factoryContract.setPropertyImplAddress(propertyImpl.address);
      await factoryContract.setMarketplaceAddress(marketplaceContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
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

      await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );

      let propertyAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      propertyContract = await IProperty.at(propertyAddress);

    });

    it("should update property", async function () {
      let result = await propertyContract.updateProperty(
        _propertyId,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The Property updating was not successful");
    });

    it("should update the values in a property correctly", async function () {
      await propertyContract.updateProperty(
        _propertyId,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      );

      let result = await propertyContract.getProperty();
      assert.strictEqual(result[1].toString(), _propertyHostUpdate, "The Host was not update correctly")
      assert.strictEqual(web3.utils.hexToUtf8(result[2]), _marketplaceIdUpdate, "The marketplaceId was not update correctly")
      assert.strictEqual(result[3].toString(), _workingDayPriceUpdate, "The workingDayPrice was not update correctly");
      assert.strictEqual(result[4].toString(), _nonWorkingDayPriceUpdate, "The nonWorkingDayPrice was not update correctly");
      assert.strictEqual(result[5].toString(), _cleaningFeeUpdate, "The cleaningFee was not update correctly");
      assert.strictEqual(result[6].toString(), _refundPercentUpdate, "The refundPercent was not update correctly");
      assert.strictEqual(result[7].toString(), _daysBeforeStartForRefundUpdate, "The daysBeforeStartForRefund was not update correctly");
      assert.isFalse(result[9], "The isInstantBooking was not update correctly");
    });

    it("should throw if trying to update property with empty propertyId", async function () {
      await expectThrow(propertyContract.updateProperty(
        "",
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHost
        }));
    });

    it("should throw if trying to update property with wrong propertyId", async function () {
      await expectThrow(propertyContract.updateProperty(
        _propertyId2,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHost
        }));
    });

    it("should throw if trying to update property with empty new host address", async function () {
      await expectThrow(propertyContract.updateProperty(
        _propertyId,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        "", {
          from: _propertyHost
        }));
    });

    it("should throw if non-host is trying to update property", async function () {
      await expectThrow(propertyContract.updateProperty(
        _propertyId,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHostUpdate
        }));
    });

    it("should emit event on property update", async function () {
      const expectedEvent = 'LogUpdateProperty';
      let result = await propertyContract.updateProperty(
        _propertyId,
        _marketplaceIdUpdate,
        _workingDayPriceUpdate,
        _nonWorkingDayPriceUpdate,
        _cleaningFeeUpdate,
        _refundPercentUpdate,
        _daysBeforeStartForRefundUpdate,
        _isInstantBookingUpdate,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Property updation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("set different price for specific date for property", () => {
    let anotherDayinSecunds = 1 * 24 * 60 * 1000;
    let randomDay = 2 * 24 * 60;
    let maxPeriodDays = 30 * 24 * 60;
    let closeOfMaxBookingDays = 60 * 24 * 60;
    let price = 2000000000000000000;
    let timestampStart;
    let timestampEnd;
    let propertyContractAddress;
    let propertyContract;

    beforeEach(async function () {
      factoryImpl = await PropertyFactory.new();
      factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
      factoryContract = await IPropertyFactory.at(factoryProxy.address);
      await factoryContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      await propertyImpl.init();

      await marketplaceContract.init(factoryContract.address);
      await factoryContract.setPropertyImplAddress(propertyImpl.address);
      await factoryContract.setMarketplaceAddress(marketplaceContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
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

      await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );

      await factoryContract.setMaxBookingPeriod(maxPeriodDays * 1000);
      timestampStart = await getFutureTimestamp(randomDay);
      timestampEnd = await getFutureTimestamp(maxPeriodDays);
      propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      propertyContract = await IProperty.at(propertyContractAddress);
    });

    it("should set different price property for some days", async() => {
      await propertyContract.setPrice(
        timestampStart,
        timestampEnd,
        price, {
          from: _propertyHost
        }
      );

      for (let day = timestampStart; day <= timestampEnd;
        (day += 86400)) {
        amount = await propertyContract.getPrice(day);
        assert(amount.eq(price), "The price was not correct set in " + day + " day");
      }
    });

    it("should set different price property for one day", async() => {
      await propertyContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _propertyHost
        }
      );

      amount = await propertyContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in " + timestampStart + " day");
    });


    it("should set different price property for two days", async() => {
      await propertyContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _propertyHost
        }
      );

      await propertyContract.setPrice(
        timestampEnd,
        timestampEnd,
        price, {
          from: _propertyHost
        }
      );

      amount = await propertyContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in startday");

      amount = await propertyContract.getPrice(timestampEnd);
      assert(amount.eq(price), "The price was not correct set in endday");
    });

    it("should set different price property for one day and for another day should be the default price", async() => {
      await propertyContract.setPrice(
        timestampStart,
        timestampStart,
        price, {
          from: _propertyHost
        }
      );

      amount = await propertyContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in startday");

      amount = await propertyContract.getPrice(timestampEnd);
      assert(amount.eq(_workingDayPrice), "The price was not correct in endday");
    });

    it("should throw when non-host trying to set price", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampEnd,
          timestampStart,
          price, {
            from: _propertyHostUpdate
          }
        )
      );
    });

    it("should throw on endDay < startDay", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampEnd,
          timestampStart,
          price, {
            from: _propertyHost
          }
        )
      );
    });

    it("should throw on startDay < now", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart - (86400 * 4),
          timestampEnd,
          price, {
            from: _propertyHost
          }
        )
      );
    });

    it("should throw on endDay < now", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          timestampStart - (86400 * 4),
          price, {
            from: _propertyHost
          }
        )
      );
    });

    it("should throw on price < 0", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          timestampEnd,
          0, {
            from: _propertyHost
          }
        )
      );
    });

    it("should throw on interval pricing > max booking days interval", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          closeOfMaxBookingDays,
          price, {
            from: _propertyHost
          }
        )
      );
    });

    it("should throw on get price with timestamp = 0", async() => {
      await expectThrow(
        propertyContract.getPrice(0)
      );
    });
  });

  xdescribe("upgrade property contract", () => {
    beforeEach(async function () {
      factoryImpl = await PropertyFactory.new();
      factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
      factoryContract = await IPropertyFactory.at(factoryProxy.address);
      await factoryContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      await propertyImpl.init();

      await marketplaceContract.init(factoryContract.address);
      await factoryContract.setPropertyImplAddress(propertyImpl.address);
      await factoryContract.setMarketplaceAddress(marketplaceContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
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

    it("should change property implementation and keep storage", async() => {
      let result = await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );
      let propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");

      propertyImpl = await Property.new();
      await propertyImpl.init();

      await factoryContract.setPropertyImplAddress(propertyImpl.address);

      propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");
    });

    it("should change property implementation and add new function", async() => {
      await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );
      let propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");

      propertyImpl2 = await PropertyUpgrade.new();
      await propertyImpl2.init();

      await factoryContract.setPropertyImplAddress(propertyImpl2.address);
      let propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      let propertyContract = IPropertyUpgrade.at(propertyContractAddress);

      await propertyContract.updateCleaningFee(_cleaningFee2);
      let result = await propertyContract.getProperty();

      assert.strictEqual(result[5].toString(), _cleaningFee2, "The cleaningFee was not set correctly");

      propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");
    });

    it("should throw when using new function without upgrade", async() => {
      await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _propertyHost
        }
      );
      let propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(1), "The properties count was not correct");

      let propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      let propertyContract = IPropertyUpgrade.at(propertyContractAddress);

      await expectThrow(propertyContract.updateCleaningFee(_cleaningFee2));
    });
  });
});