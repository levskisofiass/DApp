const web3 = require("web3");
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

  const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _propertyHost = accounts[2];

  const _propertyId = "testId123";
  const _propertyId2 = "testId223";
  const _marketplaceId = "ID123";
  const _workingDayPrice = '1000000000000000000';
  const _nonWorkingDayPrice = '2000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _refundPercent = '80';
  const _daysBeforeStartForRefund = '10';
  const _isInstantBooking = true;

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
      PropertyContract = await IProperty.at(proxy.address);
      await PropertyContract.init();
    });

    it("should create new Property", async () => {
      let result = await PropertyContract.createProperty(
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

      assert.isTrue(Boolean(result.receipt.status), "The Property creation was not successful");

      let propertiesCount = await PropertyContract.propertiesCount();
      assert(propertiesCount.eq(1), "The Propertys count was not correct");

    });

    it("should create two new Properties", async () => {
      let result = await PropertyContract.createProperty(
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

      assert.isTrue(Boolean(result.receipt.status), "The Property creation was not successful");

      let result2 = await PropertyContract.createProperty(
        _propertyId2,
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

      assert.isTrue(Boolean(result2.receipt.status), "The propertiesCount creation was not successful");

      let propertiesCount = await PropertyContract.propertiesCount();
      assert(propertiesCount.eq(2), "The propertiesCount count was not correct");

    });

    it("should set the values in a Property correctly", async function () {
      await PropertyContract.createProperty(
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

      let result = await PropertyContract.getProperty(_propertyId);
      assert.strictEqual(result[0], _propertyHost, "The host was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[1]), _marketplaceId, "The marketplaceId was not set correctly");
      assert.strictEqual(result[2].toString(), _workingDayPrice, "The workingDayPrice was not set correctly");
      assert.strictEqual(result[3].toString(), _nonWorkingDayPrice, "The nonWorkingDayPrice was not set correctly");
      assert.strictEqual(result[4].toString(), _cleaningFee, "The cleaningFee was not set correctly");
      assert.strictEqual(result[5].toString(), _refundPercent, "The refundPercent was not set correctly");
      assert.strictEqual(result[6].toString(), _daysBeforeStartForRefund, "The daysBeforeStartForRefund was not set correctly");
      assert(result[7].eq(0), "The arrayIndex was not set correctly");
      assert.isTrue(result[8], "The isInstantBooking was not set correctly");
      assert.isTrue(result[9], "The Property was not active");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await PropertyContract.createProperty(
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

      let result = await PropertyContract.getProperty(_propertyId);

      let result1 = await PropertyContract.getPropertyId(0);
      assert.strictEqual(web3.utils.hexToUtf8(result1), _propertyId, "The Property id was not set correctly");
      let result2 = await PropertyContract.getPropertyId(result[7].toNumber());
      assert.strictEqual(web3.utils.hexToUtf8(result2), _propertyId, "The Property index was not set correctly");
    });

    it("should throw if trying to create Property when paused", async function () {
      await PropertyContract.pause({ from: _owner });

      await expectThrow(PropertyContract.createProperty(
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
      await PropertyContract.createProperty(
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

      await expectThrow(PropertyContract.createProperty(
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

    it("should throw if trying to create Property with empty marketplaceId", async function () {
      await expectThrow(PropertyContract.createProperty(
        _propertyId,
        "",
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

    it("should emit event on Property creation", async function () {
      const expectedEvent = 'LogCreateProperty';
      let result = await PropertyContract.createProperty(
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

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Property creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });
});