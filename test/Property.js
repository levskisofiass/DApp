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
  const _workingDayPrice = '1000000000000000000';
  const _nonWorkingDayPrice = '2000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _cleaningFee2 = '200000000000000000';
  const _refundPercent = '80';
  const _daysBeforeStartForRefund = '10';
  const _arrayIndex = 1;
  const _isInstantBooking = true;

  const _url = "https://lockchain.co/marketplace";
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

  describe("create new property", () => {
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
        _isInstantBooking, {
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

  xdescribe("[TODO - Refactor after changes on update to work directly with Property Contract] - update property", () => {
    beforeEach(async function () {
      impl = await Property.new();
      proxy = await PropertyProxy.new(impl.address);
      propertyContract = await IProperty.at(proxy.address);
      await propertyContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      await marketplaceContract.init(propertyContract.address);
      await propertyContract.setMarketplace(marketplaceContract.address);

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
    });

    it("should throw on update Property without Marketplace contract", async() => {
      await expectThrow(propertyContract.update(
        _propertyId,
        _marketplaceId,
        _owner,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      ));
    });

    it("should throw if trying to update Property when paused", async function () {

      await propertyContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.updateProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      ));
    });

    it("should throw if trying to update Property with inactive propertyId", async function () {

      await expectThrow(marketplaceContract.updateProperty(
        "0",
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _propertyHostUpdate, {
          from: _propertyHost
        }
      ));
    });

    it("should throw if trying to update Property with another address", async function () {

      await expectThrow(marketplaceContract.updateProperty(
        _propertyId,
        _marketplaceId,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _cleaningFee,
        _refundPercent,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _propertyHostUpdate, {
          from: _notOwner
        }
      ));
    });
  });

  describe("upgrade property contract", () => {
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

  describe("set different price to property", () => {
    let anotherDayinSecunds = 1 * 24 * 60 * 1000;
    let randomDay = 2 * 24 * 60;
    let maxIntervalDays = 30 * 24 * 60;
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

      await factoryContract.setMaxBookingDaysInterval(maxIntervalDays * 1000);
      timestampStart = await getFutureTimestamp(randomDay);
      timestampEnd = await getFutureTimestamp(maxIntervalDays);
      propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      propertyContract = await IProperty.at(propertyContractAddress);
    });

    it("should set different price property for some days", async() => {

      await propertyContract.setPrice(
        timestampStart,
        timestampEnd,
        price
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
        price
      );

      amount = await propertyContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in " + timestampStart + " day");
    });


    it("should set different price property for few days", async() => {
      await propertyContract.setPrice(
        timestampStart,
        timestampStart,
        price
      );

      await propertyContract.setPrice(
        timestampEnd,
        timestampEnd,
        price
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
        price
      );

      amount = await propertyContract.getPrice(timestampStart);
      assert(amount.eq(price), "The price was not correct set in startday");

      amount = await propertyContract.getPrice(timestampEnd);
      assert(amount.eq(_workingDayPrice), "The price was not correct in endday");
    });

    it("should throw on endDay < startDay", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampEnd,
          timestampStart,
          price
        )
      );
    });

    it("should throw on startDay < now", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart - (86400 * 4),
          timestampEnd,
          price
        )
      );
    });

    it("should throw on endDay < now", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          timestampStart - (86400 * 4),
          price
        )
      );
    });

    it("should throw on price < 0", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          timestampEnd,
          0
        )
      );
    });

    it("should throw on interval pricing > max booking days interval", async() => {
      await expectThrow(
        propertyContract.setPrice(
          timestampStart,
          closeOfMaxBookingDays,
          price
        )
      );
    });

    it("should throw on get price with timestamp = 0", async() => {
      await expectThrow(
        propertyContract.getPrice(0)
      );
    });
  });
});