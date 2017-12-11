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
    const _marketplaceId = "123";
    const _workingDayPrice = 1000000000000000000;
    const _nonWorkingDayPrice = 2000000000000000000;
    const _cleaningFee = 100000000000000000;
    const _refundPercent = 80;
    const _daysBeforeStartForRefund = 10;
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
});