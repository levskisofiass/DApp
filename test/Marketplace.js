const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const MarketplaceImpl = artifacts.require("./Marketplace/MarketplaceImpl.sol");
const IMarketplaceImpl = artifacts.require("./Marketplace/IMarketplaceImpl.sol");
const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Marketplace', function (accounts) {

	let implementedContract;
	let proxy;
	let impl;
	let impl2;

	const _owner = accounts[0];
	const _notOwner = accounts[1];

	describe("creating marketplace proxy", () => {
		beforeEach(async function () {
			impl = await MarketplaceImpl.new();
			proxy = await MarketplaceProxy.new(impl.address);
			implementedContract = await IMarketplaceImpl.at(proxy.address);
			implementedContract.init();
		})

		it("should get the owner of the first contract", async function () {
			const owner = await implementedContract.getOwner.call();
			assert.strictEqual(owner, _owner, "The owner is not set correctly");
		});
	});

	describe("upgrade marketplace contract", () => {
		beforeEach(async function () {
			impl = await MarketplaceImpl.new();
			impl2 = await MarketplaceImpl.new();
			proxy = await MarketplaceProxy.new(impl.address);
			implementedContract = await IMarketplaceImpl.at(proxy.address);
			implementedContract.init();
		})

		it("should upgrade contract from owner", async function () {
			const upgradeableContract = await IOwnableUpgradeableImplementation.at(proxy.address);
			await upgradeableContract.upgradeImplementation(impl2.address, {
				from: _owner
			});
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