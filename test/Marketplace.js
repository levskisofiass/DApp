const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const RentalProxy = artifacts.require("./Property/Rental/RentalProxy.sol");
const Rental = artifacts.require("./Property/Rental/Rental.sol");
const IRental = artifacts.require("./Property/Rental/IRental.sol");

const RentalFactoryProxy = artifacts.require('./Property/Rental/RentalFactory/RentalFactoryProxy.sol');
const RentalFactory = artifacts.require('./Property/Rental/RentalFactory/RentalFactory.sol');
const IRentalFactory = artifacts.require('./Property/Rental/RentalFactory/IRentalFactory.sol');

const HotelProxy = artifacts.require('./Property/Hotel/HotelRoomsProxy.sol');
const Hotel = artifacts.require('./Property/Hotel/HotelRooms.sol');
const IHotel = artifacts.require('./Property/Hotel/IHotelRooms.sol');

const HotelFactoryProxy = artifacts.require('./Property/Hotel/HotelFactory/HotelFactoryProxy.sol');
const HotelFactory = artifacts.require('./Property/Hotel/HotelFactory/HotelFactory.sol');
const IHotelFactory = artifacts.require('./Property/Hotel/HotelFactory/IHotelFactory.sol');

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;
const _ = require('lodash');

contract('Marketplace', function (accounts) {
  let marketplaceContract;
  let marketplaceProxy;
  let marketplaceImpl;
  let marketplaceImpl2;
  let rentalContract;
  let rentalProxy;
  let rentalImpl;
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
  const _rentalHost = accounts[4];
  const _rentalHostUpdate = accounts[5];
  const _channelManager = accounts[6];

  const _marketplaceId = util.toBytes32("5a9d0e1a87");
  const _marketplaceId2 = util.toBytes32("5a9d0e1a88");
  const _url = "https://lockchain.co/marketplace";
  const _url2 = "https://lockchain.co/mp";
  const _rentalAPI = "https://lockchain.co/RentalAPI";
  const _rentalAPI2 = "https://lockchain.co/propAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _disputeAPI2 = "https://lockchain.co/disAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";
  const _exchangeContractAddress2 = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76d";

  const _rentalId = "testId1234";
  const _rentalId2 = "testId223";
  const _defaultDailyRate = '1000000000000000000';
  const _workingDayPriceUpdate = '2000000000000000000';
  const _weekendRate = '2000000000000000000';
  const _nonWorkingDayPriceUpdate = '1000000000000000000';
  const _cleaningFee = '100000000000000000';
  const _cleaningFeeUpdate = '200000000000000000';
  const _refundPercentages = ['80'];
  const _refundPercentUpdate = ['90'];
  const _daysBeforeStartForRefund = ['10'];
  const _daysBeforeStartForRefundUpdate = ['20'];
  const _isInstantBooking = true;
  const _isInstantBookingUpdate = false;
  const _rentalFactoryContract = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76a";
  const _rentalFactoryContract2 = "0x2988ae7f92f5c8cad1997ae5208aeaa68878a76b";
  const _deposit = "2000";
  const _minNightsStay = "2";
  const _rentalTitle = "Great Rental";

  const _hotelId = "testId123";
  const _hotelId2 = "testId223";
  const _roomsCount = "100";
  const _roomsCountUpdate = "300";
  const _roomsType = "single";
  const _roomsTypeUpdate = "double";
  const _hotelHost = accounts[5];

  describe("init contract", () => {
    beforeEach(async () => {

      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      await marketplaceContract.init();
    });

    it("should set correct rental factory contract", async () => {
      await marketplaceContract.setRentalFactoryContract(_rentalFactoryContract);
      let contractAddress = await marketplaceContract.getRentalFactoryContract();
      assert.strictEqual(contractAddress, _rentalFactoryContract, "The rental factory contract was not set correctly")
    });

    it("should set correct hotel factory contract", async () => {
      await marketplaceContract.setHotelFactoryContract(_rentalFactoryContract);
      let contractAddress = await marketplaceContract.getHotelFactoryContract();
      assert.strictEqual(contractAddress, _rentalFactoryContract, "The hotel factory contract was not set correctly")
    });

    it("should throw when address is wrong", async () => {
      await expectThrow(marketplaceContract.setHotelFactoryContract("0x0"));
    });
  });

  describe("creating marketplaceProxy", () => {
    beforeEach(async function () {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

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

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);
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

  describe("change rental factory contract", () => {
    beforeEach(async () => {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(_rentalFactoryContract);
    });

    it("should get correct rental factory contract", async () => {
      let contractAddress = await marketplaceContract.getRentalFactoryContract();
      assert.strictEqual(contractAddress.toString(), _rentalFactoryContract, "The rental factory contract was not set correctly")
    });

    it("should change rental factory contract", async () => {
      await marketplaceContract.setRentalFactoryContract(_rentalFactoryContract2, {
        from: _owner
      });
      let contractAddress = await marketplaceContract.getRentalFactoryContract();
      assert.strictEqual(contractAddress.toString(), _rentalFactoryContract2, "The rental factory contract was not set correctly")
    });

    it("should throw when non-owner is changing address", async () => {
      await expectThrow(marketplaceContract.setRentalFactoryContract(_rentalFactoryContract2, {
        from: _notOwner
      }));
    });

    it("should throw when address is wrong", async () => {
      await expectThrow(marketplaceContract.setRentalFactoryContract("0x0"));
    });
  });

  describe("create new Marketplace", () => {
    beforeEach(async function () {
      marketplaceImpl = await Marketplace.new();
      marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
      marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);
    });

    it("should create new marketplace", async () => {
      let result = await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The marketplace creation was not successful");

      let marketplacesCount = await marketplaceContract.marketplacesCount();
      assert(marketplacesCount.eq(1), "The marketplaces count was not correct");

    });

    it("should create two new marketplaces", async () => {
      let result = await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The marketplace creation was not successful");

      let result2 = await marketplaceContract.createMarketplace(
        _marketplaceId2,
        _url,
        _rentalAPI,
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
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.strictEqual(result[0], _marketplaceAdmin, "The admin was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[1]), _url, "The url was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[2]), _rentalAPI, "The rentalAPI was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[3]), _disputeAPI, "The disputeAPI was not set correctly");
      assert.strictEqual(result[4], _exchangeContractAddress, "The exchange contract address was not set correctly");
      assert(result[5].eq(0), "The index array was not set correctly");
      assert.isTrue(!result[6], "The marketplace was approved");
      assert.isTrue(result[7], "The marketplace was not active");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
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
        _rentalAPI,
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
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      await expectThrow(marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
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
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to create marketplace with empty rentalAPI", async function () {
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
        _rentalAPI,
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
        _rentalAPI,
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
        _rentalAPI,
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

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );
    });

    it("should update marketplace", async () => {
      let result = await marketplaceContract.updateMarketplace(
        _marketplaceId,
        _url2,
        _rentalAPI2,
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
        _rentalAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.strictEqual(result[0], _newMarketplaceAdmin, "The admin was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[1]), _url2, "The url was not set correctly");
      assert.strictEqual(web3.utils.hexToUtf8(result[2]), _rentalAPI2, "The rentalAPI was not set correctly");
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
        _rentalAPI2,
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
        _rentalAPI2,
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
        _rentalAPI2,
        _disputeAPI2,
        _exchangeContractAddress2,
        _newMarketplaceAdmin, {
          from: _marketplaceAdmin
        }
      ));
    });

    it("should throw if trying to update marketplace with empty rentalAPI", async function () {
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
        _rentalAPI2,
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
        _rentalAPI2,
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
        _rentalAPI2,
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
        _rentalAPI2,
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

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);

      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );
    });

    it("should approve marketplace", async () => {
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

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);

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

    it("should reject marketplace", async () => {
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

      rentalImpl = await Rental.new();
      rentalProxy = await RentalProxy.new(rentalImpl.address);
      rentalContract = await IRental.at(rentalProxy.address);

      await marketplaceContract.init();
      await marketplaceContract.setRentalFactoryContract(rentalContract.address);
    });

    it("should switch off the approval policy", async () => {
      let result = await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      assert.isTrue(Boolean(result.receipt.status), "Changing approval policy failed");

      let isApprovalPolicyActive = await marketplaceContract.isApprovalPolicyActive();
      assert.isTrue(!isApprovalPolicyActive, "The approval policy was not changed");
    });

    it("should create approved marketplaces when approval policy is turned off", async () => {
      await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
        _disputeAPI,
        _exchangeContractAddress, {
          from: _marketplaceAdmin
        }
      );

      let result = await marketplaceContract.getMarketplace(_marketplaceId);
      assert.isTrue(result[6], "The marketplace was not created approved");
    });

    it("should create two marketplaces with status depends on approval policy", async () => {
      await marketplaceContract.deactivateApprovalPolicy({
        from: _owner
      });
      await marketplaceContract.createMarketplace(
        _marketplaceId,
        _url,
        _rentalAPI,
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
        _rentalAPI,
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

  describe("create rental from Marketplace", () => {
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

    it("should create new rental from Marketplace", async function () {
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The rental creation was not successful");
    });

    it("should create two new Rentals", async () => {
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The Rental creation was not successful");

      let result2 = await marketplaceContract.createRental(
        _rentalId2,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );

      assert.isTrue(Boolean(result2.receipt.status), "The rental creation was not successful");

      let rentalsCount = await factoryContract.rentalsCount();
      assert(rentalsCount.eq(2), "The rentals count was not correct");

    });

    it("should set the values in a Rental correctly", async function () {
      await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );
      let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
      let rentalContractAddress = await factoryContract.getRentalContractAddress(rentalIdHash);
      let rentalContractLocal = await IRental.at(rentalContractAddress);
      let rentalChannelManger = await rentalContractLocal.getChannelManager();

      let result = await rentalContractLocal.getRental();

      assert.strictEqual(result[0].toString(), rentalIdHash, "The rentalId was not set correctly");
      assert.strictEqual(result[1], _rentalHost, "The host was not set correctly");
      assert.strictEqual(result[2].toString(), _defaultDailyRate, "The workingDayPrice was not set correctly");
      assert.strictEqual(result[3].toString(), _weekendRate, "The nonWorkingDayPrice was not set correctly");
      assert.strictEqual(result[4].toString(), _cleaningFee, "The cleaningFee was not set correctly");
      assert.isTrue(_.isEqual(result[5].toString(), _refundPercentages.toString()), "The refundPercent was not set correctly");
      assert.isTrue(_.isEqual(result[6].toString(), _daysBeforeStartForRefund.toString()), "The daysBeforeStartForRefund was not set correctly");
      assert(result[7].eq(0), "The arrayIndex was not set correctly");
      assert.isTrue(result[8], "The isInstantBooking was not set correctly");
      assert.strictEqual(result[9].toString(), _deposit, "The deposit was not set correctly");
      assert.strictEqual(result[10].toString(), _minNightsStay, "The minimum nights stay was not set correctly");
      assert.strictEqual(result[11], _rentalTitle, "The rental title was not set correctly");
      assert.strictEqual(rentalChannelManger, _channelManager, "The rental channel manager was not set correctly");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );

      let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
      let rentalContractAddress = await factoryContract.getRentalContractAddress(rentalIdHash);
      let rentalContractLocal = await IRental.at(rentalContractAddress);

      let result = await rentalContractLocal.getRental();

      let result1 = await factoryContract.getRentalId(0);
      assert.strictEqual(result1, rentalIdHash, "The Rental id was not set correctly");
      let result2 = await factoryContract.getRentalId(result[7].toNumber());
      assert.strictEqual(result2, rentalIdHash, "The Rental index was not set correctly");
    });

    it("should throw if trying to create Rental when paused", async function () {
      await marketplaceContract.pause({
        from: _owner
      });

      await expectThrow(marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      ));
    });

    it("should throw if trying to create Rental with empty marketplaceId", async function () {
      await expectThrow(marketplaceContract.createRental(
        _rentalId,
        "",
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      ));
    });

    it("should throw if trying to create Rental with not existing marketplaceId", async function () {
      await expectThrow(marketplaceContract.createRental(
        _rentalId,
        _marketplaceId2,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      ));
    });

    it("should throw if trying to create Rental with not approved marketplaceId", async function () {
      await marketplaceContract.rejectMarketplace(
        _marketplaceId, {
          from: _owner
        }
      );

      await expectThrow(marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      ));
    });

    it("should emit event on Rental creation", async function () {
      const expectedEvent = 'LogCreateRentalFromMarketplace';
      let result = await marketplaceContract.createRental(
        _rentalId,
        _marketplaceId,
        _defaultDailyRate,
        _weekendRate,
        _cleaningFee,
        _refundPercentages,
        _daysBeforeStartForRefund,
        _isInstantBooking,
        _deposit,
        _minNightsStay,
        _rentalTitle,
        _channelManager, {
          from: _rentalHost
        }
      );

      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Rental creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });

  xdescribe("create hotel from Marketplace", () => {
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
      await factoryContract.setImplAddress(hotelImpl.address);
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

    it("should create new hotel from Marketplace", async function () {
      let result = await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _defaultDailyRate, {
          from: _hotelHost
        }
      );

      let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
      assert(hotelsCount.eq(1), "The hotels count was not correct");

      assert.isTrue(Boolean(result.receipt.status), "The hotel creation was not successful");
    });

    it("should create two new Hotels", async () => {
      let result = await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _defaultDailyRate, {
          from: _hotelHost
        }
      );

      assert.isTrue(Boolean(result.receipt.status), "The hotel creation was not successful");

      let result2 = await marketplaceContract.createHotelRooms(
        _hotelId2,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _defaultDailyRate, {
          from: _hotelHost
        }
      );

      assert.isTrue(Boolean(result2.receipt.status), "The hotel creation was not successful");

      let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
      assert(hotelsCount.eq(2), "The hotels count was not correct");

    });

    it("should set the values in a Hotel correctly", async function () {
      await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _defaultDailyRate, {
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
      assert.strictEqual(result[5].toString(), _defaultDailyRate, "The workingDayPrice was not set correctly");
      assert(result[6].eq(0), "The arrayIndex was not set correctly");
    });

    it("should append to the indexes array and set the last element correctly", async function () {
      await marketplaceContract.createHotelRooms(
        _hotelId,
        _marketplaceId,
        _roomsCount,
        _roomsType,
        _defaultDailyRate, {
          from: _hotelHost
        }
      );

      let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
      let hotelContractLocal = await IHotel.at(hotelContractAddress);
      let result = await hotelContractLocal.getHotelRoom();

      let result1 = await factoryContract.getHotelRoomTypePairId(0);
      let hotelRoomsHash = await factoryContract.hashHotelRoomTypePair(_hotelId, _roomsType);
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
        _defaultDailyRate, {
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
        _defaultDailyRate, {
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
        _defaultDailyRate, {
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
        _defaultDailyRate, {
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
        _defaultDailyRate, {
          from: _hotelHost
        }
      );
      assert.lengthOf(result.logs, 1, "There should be 1 event emitted from Hotel creation!");
      assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
    });
  });
});