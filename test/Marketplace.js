const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyProxy = artifacts.require("./Property/PropertyProxy.sol");
const Property = artifacts.require("./Property/Property.sol");
const IProperty = artifacts.require("./Property/IProperty.sol");

const PropertyFactoryProxy = artifacts.require('./Property/PropertyFactory/PropertyFactoryProxy.sol')
const PropertyFactory = artifacts.require('./Property/PropertyFactory/PropertyFactory.sol')
const IPropertyFactory = artifacts.require('./Property/PropertyFactory/IPropertyFactory.sol')

const HotelProxy = artifacts.require('./Hotel/HotelRoomsProxy.sol')
const Hotel = artifacts.require('./Hotel/HotelRooms.sol')
const IHotel = artifacts.require('./Hotel/IHotelRooms.sol')

const HotelFactoryProxy = artifacts.require('./Hotel/HotelFactory/HotelFactoryProxy.sol')
const HotelFactory = artifacts.require('./Hotel/HotelFactory/HotelFactory.sol')
const IHotelFactory = artifacts.require('./Hotel/HotelFactory/IHotelFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Marketplace', function (accounts) {
  let marketplaceContract;
  let marketplaceProxy;
  let marketplaceImpl;
  let marketplaceImpl2;
  let propertyContract;
  let propertyProxy;
  let propertyImpl;
  let factoryContract;
  let factoryProxy;
  let factoryImpl;
  let hotelContract;
  let hotelProxy;
  let hotelImpl;
  let hotelImpl2;

  const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _marketplaceAdmin = accounts[2];
  const _newMarketplaceAdmin = accounts[3];
  const _propertyHost = accounts[4];
  const _propertyHostUpdate = accounts[5];

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
  const _workingDayPriceUpdate = '2000000000000000000';
  const _nonWorkingDayPrice = '2000000000000000000';
  const _nonWorkingDayPriceUpdate = '1000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _cleaningFeeUpdate = '200000000000000000';
  const _refundPercent = '80';
  const _refundPercentUpdate = '90';
  const _daysBeforeStartForRefund = '10';
  const _daysBeforeStartForRefundUpdate = '20';
  const _isInstantBooking = true;
  const _isInstantBookingUpdate = false;
  const _propertyFactoryContract = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76a";
  const _propertyFactoryContract2 = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76b";

  const _hotelId = "testId123";
  const _hotelId2 = "testId223";
  const _roomsCount = "100";
  const _roomsCountUpdate = "300";
  const _roomsType = "single";
  const _roomsTypeUpdate = "double";
  const _hotelHost = accounts[5];

  describe("init contract", () => {
    beforeEach(async() => {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      marketplaceContract.init();
    });

    it("should set correct property factory contract", async() => {
      await marketplaceContract.setPropertyFactoryContract(_propertyFactoryContract);
      let contractAddress = await marketplaceContract.getPropertyFactoryContract();
      assert.strictEqual(contractAddress.toString(), _propertyFactoryContract, "The property factory contract was not set correctly")
    });

    it("should throw when address is wrong", async() => {
      await expectThrow(marketplaceContract.setHotelFactoryContract("0x0"));
    });
  });

  describe("creating marketplaceProxy", () => {
    beforeEach(async function () {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
    });

    it("should get the owner of the first contract", async function () {
      const owner = await marketplaceContract.getOwner();
      assert.strictEqual(owner, _owner, "The owner is not set correctly");
    });
  });

  describe("upgrade marketplace contract", () => {
    beforeEach(async function () {
      marketplaceImpl = await Marketplace.new();
      marketplaceImpl2 = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);
    });

    it("should upgrade contract from owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(marketplaceProxy.address);
      await upgradeableContract.upgradeImplementation(marketplaceImpl2.address);
      const newImplAddress = await upgradeableContract.getImplementation();
      assert.strictEqual(marketplaceImpl2.address, newImplAddress, "The owner is not set correctly");
    });

    it("should throw on upgrade contract from not owner", async function () {
      const upgradeableContract = await IOwnableUpgradeableImplementation.at(marketplaceProxy.address);
      await expectThrow(upgradeableContract.upgradeImplementation(marketplaceImpl2.address, {
        from: _notOwner
      }));
    });
  });

  describe("change property factory contract", () => {
    beforeEach(async() => {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(_propertyFactoryContract);
    });

    it("should get correct property factory contract", async() => {
      let contractAddress = await marketplaceContract.getPropertyFactoryContract();
      assert.strictEqual(contractAddress.toString(), _propertyFactoryContract, "The property factory contract was not set correctly")
    });

    it("should change property factory contract", async() => {
      await marketplaceContract.setPropertyFactoryContract(_propertyFactoryContract2, {
        from: _owner
      });
      let contractAddress = await marketplaceContract.getPropertyFactoryContract();
      assert.strictEqual(contractAddress.toString(), _propertyFactoryContract2, "The property factory contract was not set correctly")
    });

    it("should throw when non-owner is changing address", async() => {
      await expectThrow(marketplaceContract.setPropertyFactoryContract(_propertyFactoryContract2, {
        from: _notOwner
      }));
    });

    it("should throw when address is wrong", async() => {
      await expectThrow(marketplaceContract.setPropertyFactoryContract("0x0"));
    });
  });

  describe("create new Marketplace", () => {
    beforeEach(async function () {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);
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
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);

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
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);

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
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);

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
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      propertyImpl = await Property.new();
      propertyProxy = await PropertyProxy.new(propertyImpl.address);
      propertyContract = await IProperty.at(propertyProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(propertyContract.address);
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

  describe("create property from Marketplace", () => {
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

      await marketplaceContract.init();
      await marketplaceContract.setPropertyFactoryContract(factoryContract.address);
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

    it("should create new property from Marketplace", async function () {
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

      assert.isTrue(Boolean(result.receipt.status), "The property creation was not successful");
    });

    it("should create two new Properties", async() => {
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

      assert.isTrue(Boolean(result.receipt.status), "The Property creation was not successful");

      let result2 = await marketplaceContract.createProperty(
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

      assert.isTrue(Boolean(result2.receipt.status), "The property creation was not successful");

      let propertiesCount = await factoryContract.propertiesCount();
      assert(propertiesCount.eq(2), "The properties count was not correct");

    });

    it("should set the values in a Property correctly", async function () {
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

      let propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      let propertyContractLocal = await IProperty.at(propertyContractAddress);

      let result = await propertyContractLocal.getProperty();

      assert.strictEqual(web3.utils.hexToUtf8(result[0]), _propertyId, "The propertyId was not set correctly");
      assert.strictEqual(result[1], _propertyHost, "The host was not set correctly");
      assert.strictEqual(result[2], _marketplaceId, "The marketplaceId was not set correctly");
      assert.strictEqual(result[3].toString(), _workingDayPrice, "The workingDayPrice was not set correctly");
      assert.strictEqual(result[4].toString(), _nonWorkingDayPrice, "The nonWorkingDayPrice was not set correctly");
      assert.strictEqual(result[5].toString(), _cleaningFee, "The cleaningFee was not set correctly");
      assert.strictEqual(result[6].toString(), _refundPercent, "The refundPercent was not set correctly");
      assert.strictEqual(result[7].toString(), _daysBeforeStartForRefund, "The daysBeforeStartForRefund was not set correctly");
      assert(result[8].eq(0), "The arrayIndex was not set correctly");
      assert.isTrue(result[9], "The isInstantBooking was not set correctly");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
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

      let propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);
      let propertyContractLocal = await IProperty.at(propertyContractAddress);

      let result = await propertyContractLocal.getProperty();

      let result1 = await factoryContract.getPropertyId(0);
      assert.strictEqual(web3.utils.hexToUtf8(result1), _propertyId, "The Property id was not set correctly");
      let result2 = await factoryContract.getPropertyId(result[8].toNumber());
      assert.strictEqual(web3.utils.hexToUtf8(result2), _propertyId, "The Property index was not set correctly");
    });

    it("should throw if trying to create Property when paused", async function () {
      await marketplaceContract.pause({
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

    it("should throw if trying to create Property with empty marketplaceId", async function () {
      await expectThrow(marketplaceContract.createProperty(
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

    it("should throw if trying to create Property with not existing marketplaceId", async function () {
      await expectThrow(marketplaceContract.createProperty(
        _propertyId,
        _marketplaceId2,
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

    it("should throw if trying to create Property with not approved marketplaceId", async function () {
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

    it("should emit event on Property creation", async function () {
      const expectedEvent = 'LogCreatePropertyFromMarketplace';
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

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Property creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  describe("create hotel from Marketplace", () => {
    beforeEach(async function () {
      factoryImpl = await HotelFactory.new();
      factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
      factoryContract = await IHotelFactory.at(factoryProxy.address);
      await factoryContract.init();

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      hotelImpl = await Hotel.new();
      await hotelImpl.init();

      await marketplaceContract.init();
      await marketplaceContract.setHotelFactoryContract(factoryContract.address);
      await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
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

    it("should create new hotel from Marketplace", async function () {
      let result = await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );

      let hotelsCount = await factoryContract.hotelRoomsPairsCount();
      assert(hotelsCount.eq(1), "The hotels count was not correct");

      assert.isTrue(Boolean(result.receipt.status), "The hotel creation was not successful");
    });

    it("should create two new Hotels", async() => {
      let result = await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The hotel creation was not successful");

      let result2 = await marketplaceContract.createHotelRooms(
        _hotelId2,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );

      assert.isTrue(Boolean(result2.receipt.status), "The hotel creation was not successful");

      let hotelsCount = await factoryContract.hotelRoomsPairsCount();
      assert(hotelsCount.eq(2), "The hotels count was not correct");

    });

    it("should set the values in a Hotel correctly", async function () {
      await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );

      let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
      let hotelContractLocal = await IHotel.at(hotelContractAddress);

      let result = await hotelContractLocal.getHotelRoom();
      assert.strictEqual(web3.utils.hexToUtf8(result[0]), _hotelId, "The hotelId was not set correctly");
      assert.strictEqual(result[1], _marketplaceId, "The marketplaceId was not set correctly");
      assert.strictEqual(result[2], _hotelHost, "The host was not set correctly");
      assert.strictEqual(result[3].toString(), _roomsCount, "The roomsCount was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[4]), _roomsType, "The roomsType was not set correctly");
      assert.strictEqual(result[5].toString(), _workingDayPrice, "The workingDayPrice was not set correctly");
      assert(result[6].eq(0), "The arrayIndex was not set correctly");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );

      let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
      let hotelContractLocal = await IHotel.at(hotelContractAddress);
      let result = await hotelContractLocal.getHotelRoom();

      let result1 = await factoryContract.getHotelRoomsId(0);
      let hotelRoomsHash = await factoryContract.hashHotelRoom(_hotelId, _roomsType);
      assert.strictEqual(result1, hotelRoomsHash, "The HotelRooms id was not set correctly");
    });

    it("should throw if trying to create Hotel when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      ));
    });

    it("should throw if trying to create Hotel with empty marketplaceId", async function () {
      await expectThrow(marketplaceContract.createHotelRooms(
        _hotelId,
        "",
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      ));
    });

    it("should throw if trying to create Hotel with not existing marketplaceId", async function () {
      await expectThrow(marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId2,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      ));
    });

    it("should throw if trying to create Hotel with not approved marketplaceId", async function () {
      await marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );

      await expectThrow(marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      ));
    });

    it("should emit event on Hotel creation", async function () {
      const expectedEvent = 'LogCreateHotelFromMarketplace';
      let result = await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _workingDayPrice, {
          from: _hotelHost
        }
      );
      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Hotel creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });
});