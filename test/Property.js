const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyProxy = artifacts.require('./Property/PropertyProxy.sol')
const Property = artifacts.require('./Property/Property.sol')
const IProperty = artifacts.require('./Property/IProperty.sol')

const PropertyFactoryProxy = artifacts.require('./Property/PropertyFactory/PropertyFactoryProxy.sol')
const PropertyFactory = artifacts.require('./Property/PropertyFactory/PropertyFactory.sol')
const IPropertyFactory = artifacts.require('./Property/PropertyFactory/IPropertyFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

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
  const _refundPercent = '80';
  const _daysBeforeStartForRefund = '10';
  const _arrayIndex = 1;
  const _isInstantBooking = true;

  const _url = "https://lockchain.co/marketplace";
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

  describe("creating property proxy", () => {
    beforeEach(async function () {
      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);
      await propertyContract.init();
    });

    it("should get the owner of the first contract", async function () {
      const owner = await propertyContract.getOwner();
      assert.strictEqual(owner, _owner, "The owner is not set correctly");
    });
  });

  describe("upgrade property contract", () => {
    beforeEach(async function () {
      propertyImpl = await Property.new();
      propertyImpl2 = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);
      await propertyContract.init();
    });

    it("should upgrade contract from owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(propertyProxy.address);
      await upgradeableContract.upgradeImplementation(propertyImpl2.address);
      const newImplAddress = await upgradeableContract.getImplementation();
      assert.strictEqual(propertyImpl2.address, newImplAddress, "The owner is not set correctly");
    });

    it("should throw on upgrade contract from not owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(propertyProxy.address);
      await expectThrow(upgradeableContract.upgradeImplementation(propertyImpl2.address, {
        from: _notOwner
      }));
    });
  });

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
});