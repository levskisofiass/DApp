const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyProxy = artifacts.require('./Property/PropertyProxy.sol')
const Property = artifacts.require('./Property/Property.sol')
const IProperty = artifacts.require('./Property/IProperty.sol')
const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Property', function (accounts) {

  let propertyContract;
  let proxy;
  let impl;
  let impl2;

  let marketplaceProxy;
  let marketplaceImpl;
  let marketplaceContract;

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
  const _isInstantBooking = true;

  const _url = "https://lockchain.co/marketplace";
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

  describe("creating property proxy", () => {
    beforeEach(async function () {
      impl = await Property.new();
      proxy = await PropertyProxy.new(impl.address);
      propertyContract = await IProperty.at(proxy.address);
      await propertyContract.init();
    });

    it("should get the owner of the first contract", async function () {
      const owner = await propertyContract.getOwner();
      assert.strictEqual(owner, _owner, "The owner is not set correctly");
    });
  });

  describe("working with marketplace", () => {
    beforeEach(async function () {
      mpl = await Property.new();
      proxy = await PropertyProxy.new(impl.address);
      propertyContract = await IProperty.at(proxy.address);
      await propertyContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      await marketplaceContract.init(propertyContract.address);
    });

    it("should throw set marketplace address not owner", async() => {
      await expectThrow(propertyContract.setMarketplace(marketplaceContract.address, {
        from: _notOwner
      }));
    });

    it("should throw marketplace address is wrong", async() => {
      await expectThrow(propertyContract.setMarketplace("0x0"));
    });
  });

  describe("upgrade property contract", () => {
    beforeEach(async function () {
      impl = await Property.new();
      impl2 = await Property.new();
      proxy = await PropertyProxy.new(impl.address);
      propertyContract = await IProperty.at(proxy.address);
      await propertyContract.init();
    });

    it("should upgrade contract from owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(proxy.address);
      await upgradeableContract.upgradeImplementation(impl2.address);
      const newImplAddress = await upgradeableContract.getImplementation();
      assert.strictEqual(impl2.address, newImplAddress, "The owner is not set correctly");
    });

    it("should throw on upgrade contract from not owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(proxy.address);
      await expectThrow(upgradeableContract.upgradeImplementation(impl2.address, {
        from: _notOwner
      }));
    });
  });

  describe("create new Property", () => {
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
    });

    it("should throw on create new Property without Marketplace contract", async() => {
      await expectThrow(propertyContract.create(
        _propertyId,
        _marketplaceId,
        _owner,
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

    it("should throw if trying to create Property when paused", async function () {

      await propertyContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.createProperty(
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
      ));
    });

    it("should throw if the same PropertyId is used twice", async function () {

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

      await expectThrow(marketplaceContract.createProperty(
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
      ));
    });

    it("should throw when marketplace is reject", async function () {

      await marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );

      await expectThrow(marketplaceContract.createProperty(
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
      ));
    });
  });

  describe("update property", () => {
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