const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyFactory = artifacts.require('./Property/PropertyFactory/PropertyFactory.sol');
const IPropertyFactory = artifacts.require('./Property/PropertyFactory/IPropertyFactory.sol');

const RentalProxy = artifacts.require('./Property/Rental/RentalProxy.sol');
const Rental = artifacts.require('./Property/Rental/Rental.sol');
const IRental = artifacts.require('./Property/Rental/IRental.sol');

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Rental factory', function (accounts) {
    let factoryContract;
    let factoryImpl;
    let rentalImpl;

    let marketplaceProxy;
    let marketplaceImpl;
    let marketplaceContract;

    const _owner = accounts[0];
    const _notOwner = accounts[1];

    describe("change marketplace contract address", () => {
        beforeEach(async function () {
            factoryImpl = await PropertyFactory.new();
            factoryContract = await IPropertyFactory.at(factoryImpl.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
            await marketplaceContract.init();
        });

        it("should set correct marketplace address", async function () {
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            const marketplaceAddress = await factoryContract.getMarketplaceAddress();
            assert.strictEqual(marketplaceAddress, marketplaceContract.address, "The marketplace address is not set correctly");
        });

        it("should change marketplace address", async function () {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init();
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            const marketplaceAddress = await factoryContract.getMarketplaceAddress();

            assert.strictEqual(marketplaceContract.address, marketplaceAddress, "The marketplace address is not set correctly");
        });

        it("should throw on change marketplace address from non-owner", async () => {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init();
            await expectThrow(
                factoryContract.setMarketplaceAddress(marketplaceContract.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("change implementation contract address", () => {
        beforeEach(async function () {
            factoryImpl = await PropertyFactory.new();
            factoryContract = await IPropertyFactory.at(factoryImpl.address);
            await factoryContract.init();

            rentalImpl = await Rental.new();
            await rentalImpl.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
            await marketplaceContract.init();

            await factoryContract.setMarketplaceAddress(marketplaceContract.address);
        });

        it("should set correct marketplace address", async function () {
            await factoryContract.setImplAddress(rentalImpl.address);

            const implAddress = await factoryContract.getImplAddress();
            assert.strictEqual(implAddress, rentalImpl.address, "The impl address is not set correctly");
        });

        it("should change marketplace address", async function () {
            rentalImpl = await Rental.new();
            await rentalImpl.init();
            await factoryContract.setImplAddress(rentalImpl.address);

            const implAddress = await factoryContract.getImplAddress();

            assert.strictEqual(implAddress, rentalImpl.address, "The impl address is not set correctly");
        });

        it("should throw on change marketplace address from non-owner", async () => {
            rentalImpl = await Rental.new();
            await rentalImpl.init();

            await expectThrow(
                factoryContract.setImplAddress(rentalImpl.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("change max booking period", () => {
        let maxPeriodDays = 30 * 24 * 60 * 1000;

        beforeEach(async function () {
            factoryImpl = await PropertyFactory.new();
            factoryContract = await IPropertyFactory.at(factoryImpl.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
            await marketplaceContract.init();
        });

        it("should set max booking days period", async function () {
            await factoryContract.setMaxBookingPeriod(maxPeriodDays);

            let period = await factoryContract.getMaxBookingPeriod();
            assert(period.eq(maxPeriodDays), "period was not correctly");
        });

        it("should throw on max booking days period = 0", async () => {
            await expectThrow(
                factoryContract.setMaxBookingPeriod(0)
            );
        });

        it("should throw on set max booking days period from non-owner", async () => {
            await expectThrow(
                factoryContract.setMaxBookingPeriod(maxPeriodDays, {
                    from: _notOwner
                })
            );
        });
    });

});