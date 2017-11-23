const web3 = require("web3");
const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");
const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Marketplace', function (accounts) {

	let marketplaceContract;
	let proxy;
	let impl;
	let impl2;

	const _owner = accounts[0];
  const _notOwner = accounts[1];
  const _marketplaceAdmin = accounts[2];

  const _marketplaceId = util.toBytes32("5a9d0e1a87");
  const _marketplaceId2 = util.toBytes32("5a9d0e1a88");
  const _url = "https://lockchain.co/marketplace";
  const _propertyAPI = "https://lockchain.co/PropertyAPI";
  const _disputeAPI = "https://lockchain.co/DisuputeAPI";
  const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

	describe("creating marketplace proxy", () => {
		beforeEach(async function () {
			impl = await Marketplace.new();
			proxy = await MarketplaceProxy.new(impl.address);
      marketplaceContract = await IMarketplace.at(proxy.address);
      await marketplaceContract.init();
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
      await marketplaceContract.init();
    });

    it("should create new marketplace", async () => {
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

    it("should create two new marketplaces", async () => {
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

    it("should set the values in a marketplace correctly", async function() {
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
      assert.isTrue(!result[6], "The reservation was approved");
      assert.isTrue(result[7], "The reservation was not active");
    });

    it("should append to the indexes array and set the last element correctly", async function() {
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

    it("should throw if trying to create marketplace when paused", async function() {
      await marketplaceContract.pause({from: _owner});

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

    it("should throw if the same marketplaceId is used twice", async function() {
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

    it("should throw if trying to create marketplace with empty url", async function() {
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

    it("should throw if trying to create marketplace with empty propertyAPI", async function() {
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

    it("should throw if trying to create marketplace with empty disputeAPI", async function() {
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

    it("should throw if trying to create marketplace with empty exchange address", async function() {
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

    it("should emit event on reservation", async function() {
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

	describe("upgrade marketplace contract", () => {
		beforeEach(async function () {
			impl = await Marketplace.new();
			impl2 = await Marketplace.new();
			proxy = await MarketplaceProxy.new(impl.address);
			marketplaceContract = await IMarketplace.at(proxy.address);
			await marketplaceContract.init();
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

});