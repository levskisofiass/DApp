const web3 = require("web3");
//Marketplace
const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

//Property
const PropertyProxy = artifacts.require("./Property/PropertyProxy.sol");
const Property = artifacts.require("./Property/Property.sol");
const IProperty = artifacts.require("./Property/IProperty.sol");

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Marketplace', function (accounts) {

  let marketplaceContract;
  let propertyContract;
  let proxy;
  let proxy2;
  let proxy3;
  let impl;
  let impl2;
  let impl3;

  const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _marketplaceAdmin = accounts[2];
  const _newMarketplaceAdmin = accounts[3];
  const _propertyHost = accounts[4];

  const _marketplaceId = util.toBytes32("5a9d0e1a87");
  const _marketplaceId2 = util.toBytes32("5a9d0e1a88");
  const _url = "https://lockchain.co/marketplace";
  const _url2 = "https://lockchain.co/mp";
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _propertyAPI2 = "https://lockchain.co/propAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _disputeAPI2 = "https://lockchain.co/disAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";
  const _exchangeContractAddress2 = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76d";

  const _propertyId = "testId1234";
  const _propertyId2 = "testId223";
  const _workingDayPrice = '1000000000000000000';
  const _nonWorkingDayPrice = '2000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _refundPercent = '80';
  const _daysBeforeStartForRefund = '10';
  const _isInstantBooking = true;

  describe("creating marketplace proxy", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);
    });

    it("should get the owner of the first contract", async function () {
      const owner = await marketplaceContract.getOwner();
      assert.strictEqual(owner, _owner, "The owner is not set correctly");
    });
  });

  describe("create new Marketplace", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);
    });

    it("should create new marketplace", async() => {
      let result = await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The marketplace creation was not successful");

      let marketplacesCount = await marketplaceContract.marketplacesCount();
      assert(marketplacesCount.eq(1), "The marketplaces count was not correct");

    });

    it("should create two new marketplaces", async() => {
      let result = await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The marketplace creation was not successful");

      let result2 = await marketplaceContract.createMarketplace(
        _marketplaceId2,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result2.receipt.status), "The marketplace creation was not successful");

      let marketplacesCount = await marketplaceContract.marketplacesCount();
      assert(marketplacesCount.eq(2), "The marketplaces count was not correct");

    });

    it("should set the values in a marketplace correctly", async function () {
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.strictEqual(result[0], _marketplaceAdmin, "The admin was not set correctly");
      assert.strictEqual(web3.utils.hexToAscii(result[1]), _url, "The url was not set correctly");
      assert.strictEqual(web3.utils.hexToAscii(result[2]), _propertyAPI, "The propertyAPI was not set correctly");
      assert.strictEqual(web3.utils.hexToAscii(result[3]), _disputeAPI, "The disputeAPI was not set correctly");
      assert.strictEqual(result[4], _exchangeContractAddress, "The exchange contract address was not set correctly");
      assert(result[5].eq(0), "The index array was not set correctly");
      assert.isTrue(!result[6], "The marketplace was approved");
      assert.isTrue(result[7], "The marketplace was not active");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);

      let result1 = await marketplaceContract.getMarketplaceId(0);
      assert.strictEqual(result1, _marketplaceId, "The marketplace index was not set correctly");
      let result2 = await marketplaceContract.getMarketplaceId(result[5].toNumber());
      assert.strictEqual(result2, _marketplaceId, "The marketplace index was not set correctly");
    });

    it("should throw if trying to create marketplace when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if the same marketplaceId is used twice", async function () {
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to create marketplace with empty url", async function () {
      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        "",
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to create marketplace with empty propertyAPI", async function () {
      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        "",
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to create marketplace with empty disputeAPI", async function () {
      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        "",
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to create marketplace with empty exchange address", async function () {
      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        0x0, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should emit event on marketplace creation", async function () {
      const expectedEvent = 'LogCreateMarketplace';
      let result = await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from marketplace creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("update existing Marketplace", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );
    });

    it("should update marketplace", async() => {
      let result = await marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The marketplace update was not successful");
    });

    it("should update values in a marketplace correctly", async function () {
      await marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.strictEqual(result[0], _newMarketplaceAdmin, "The admin was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[1]), _url2, "The url was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[2]), _propertyAPI2, "The propertyAPI was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[3]), _disputeAPI2, "The disputeAPI was not set correctly");
      assert.strictEqual(result[4], _exchangeContractAddress2, "The exchange contract address was not set correctly");
      assert(result[5].eq(0), "The index array was not set correctly");
      assert.isTrue(!result[6], "The marketplace was approved");
      assert.isTrue(result[7], "The marketplace was not active");
    });

    it("should throw if non admin trying to update", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _newMarketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty url", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        "",
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty propertyAPI", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        "",
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty disputeAPI", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        "",
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty exchange address", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        0x0,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty admin address", async function () {
      await expectThrow(marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        0x0, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should emit event on marketplace update", async function () {
      const expectedEvent = 'LogUpdateMarketplace';
      let result = await marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _propertyAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from marketplace creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });

  });

  describe("approve Marketplace", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );
    });

    it("should approve marketplace", async() => {
      let approveResult = await marketplaceContract.approveMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );
      assert.isTrue(Boolean(approveResult.receipt.status), "The marketplace approval was not successful");

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.isTrue(result[6], "The marketplace was not approved");
    });

    it("should throw if not owner trying to approve marketplace", async function () {
      await expectThrow(marketplaceContract.approveMarketplace(
        _marketplaceId, {
          from: _notOwner
        }));
    });

    it("should throw if trying to approve marketplace when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.approveMarketplace(
        _marketplaceId, {
          from: _owner
        }));
    });

    it("should emit event on marketplace approval", async function () {
      const expectedEvent = 'LogApproveMarketplace';
      let result = await marketplaceContract.approveMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from marketplace approval!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("reject Marketplace", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);

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

    it("should reject marketplace", async() => {
      let rejectResult = await marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );
      assert.isTrue(Boolean(rejectResult.receipt.status), "The marketplace rejection was not successful");

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.isTrue(!result[6], "The marketplace was not rejected");
    });

    it("should throw if not owner trying to reject marketplace", async function () {
      await expectThrow(marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _notOwner
        }));
    });

    it("should throw if trying to reject marketplace when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }));
    });

    it("should emit event on marketplace rejection", async function () {
      const expectedEvent = 'LogRejectMarketplace';
      let result = await marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from marketplace approval!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("change approval policy", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);
    });

    it("should switch off the approval policy", async() => {
      let result = await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      assert.isTrue(Boolean(result.receipt.status), "Changing approval policy failed");

      let isApprovalPolicyActive = await marketplaceContract.isApprovalPolicyActive();
      assert.isTrue(!isApprovalPolicyActive, "The approval policy was not changed");
    });

    it("should create approved marketplaces when approval policy is turned off", async() => {
      await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.isTrue(result[6], "The marketplace was not created approved");
    });

    it("should create two marketplaces with status depends on approval policy", async() => {
      await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let marketplace1 = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.isTrue(marketplace1[6], "The marketplace was not created approved");

      await marketplaceContract.activateApprovalPolicy({
        from: _owner
      });
      await marketplaceContract.createMarketplace(
        _marketplaceId2,
        _url,
        _propertyAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let marketplace2 = await marketplaceContract.getMarketplace(_marketplaceId2);
      assert.isTrue(!marketplace2[6], "The marketplace was created approved");
    });

    it("should throw if not owner trying to change the approval policy", async function () {
      await expectThrow(marketplaceContract.deactivateApprovalPolicy({
        from: _notOwner
      }));
      await expectThrow(marketplaceContract.activateApprovalPolicy({
        from: _notOwner
      }));
    });

    it("should throw if trying to change the approval policy when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      }));
      await expectThrow(marketplaceContract.activateApprovalPolicy({
        from: _owner
      }));
    });

    it("should emit event on deactivating approval policy", async function () {
      const expectedEvent = 'LogChangeApprovalPolicy';
      let result = await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from deactivating approval policy!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });

    it("should emit event on activating approval policy", async function () {
      const expectedEvent = 'LogChangeApprovalPolicy';
      let result = await marketplaceContract.activateApprovalPolicy({
        from: _owner
      });

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from activating approval policy!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("upgrade marketplace contract", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      impl2 = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);
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

  describe("Create property with Marketplace", () => {
    beforeEach(async function () {
      impl = await Marketplace.new();
      proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);

      impl3 = await Property.new();
      proxy3 = await PropertyProxy.new(impl3.address);
      propertyContract = await IProperty.at(proxy3.address);

      await marketplaceContract.init(propertyContract.address);

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

    it("should create new property from Marketplace", async function () {

      let result = await marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId,
        marketplaceContract.address,
        _workingDayPrice,
        _nonWorkingDayPrice,
        _refundPercent,
        _cleaningFee,
        _daysBeforeStartForRefund,
        _isInstantBooking, {
          from: _owner
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The propertiesCount creation was not successful");
    });
  });
});