const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const RentalProxy = artifacts.require('./Rental/RentalProxy.sol')
const Rental = artifacts.require('./Rental/Rental.sol')
const IRental = artifacts.require('./Rental/IRental.sol')

const RentalFactoryProxy = artifacts.require('./Rental/RentalFactory/RentalFactoryProxy.sol')
const RentalFactory = artifacts.require('./Rental/RentalFactory/RentalFactory.sol')
const IRentalFactory = artifacts.require('./Property/Rental/RentalFactory/IRentalFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Rental factory', function (accounts) {
    let factoryContract;
    let factoryProxy;
    let factoryImpl;
    let factoryImpl2;
    let rentalImpl;
    let rentalImpl2;

    let marketplaceProxy;
    let marketplaceImpl;
    let marketplaceContract;

    const _owner = accounts[0];
    const _notOwner = accounts[1];
    const _marketplaceAdmin = accounts[2];
    const _rentalHost = accounts[3];
    const _channelManger = accounts[4];

    const _rentalId = "testId123";
    const _rentalId2 = "testId223";
    const _marketplaceId = "ID123";
    const _defaultDailyRate = '1000000000000000000';
    const _weekendRate = '2000000000000000000';
    const _cleaningFee = '100000000000000000';
    const _refundPercentages = ['80'];
    const _daysBeforeStartForRefund = ['10'];
    const _isInstantBooking = true;
    const _deposit = "2000";
    const _minNightsStay = "2";
    const _rentalTitle = "Great Rental";

    const _url = "https://lockchain.co/marketplace";
    const _rentalAPI = "https://lockchain.co/RentalAPI";
    const _disputeAPI = "https://lockchain.co/DisuputeAPI";
    const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

    describe("creating rental factory proxy", () => {
        beforeEach(async function () {
            rentalImpl = await Rental.new();
            await rentalImpl.init();

            factoryImpl = await RentalFactory.new();
            factoryProxy = await RentalFactoryProxy.new(factoryImpl.address);
            factoryContract = await IRentalFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setImplAddress(rentalImpl.address);
        });

        it("should get the owner of the first contract", async function () {
            const owner = await factoryContract.getOwner();
            assert.strictEqual(owner, _owner, "The owner is not set correctly");
        });
    });

    describe("upgrade rental factory contract", () => {
        beforeEach(async function () {
            rentalImpl = await Rental.new();
            await rentalImpl.init();

            factoryImpl = await RentalFactory.new();
            factoryImpl2 = await RentalFactory.new();
            factoryProxy = await RentalFactoryProxy.new(factoryImpl.address);
            factoryContract = await IRentalFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setImplAddress(rentalImpl.address);
        });

        it("should upgrade contract from owner", async function () {
            await factoryContract.upgradeImplementation(factoryImpl2.address);
            const newImplAddress = await factoryContract.getImplementation();
            assert.strictEqual(factoryImpl2.address, newImplAddress, "The new implementation is not set correctly");
        });

        it("should throw on upgrade contract from not owner", async function () {
            await expectThrow(factoryContract.upgradeImplementation(factoryImpl2.address, {
                from: _notOwner
            }));
        });
    });

    describe("create new rental", () => {
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

        it("should create new rental from Marketplace contract and Rental factory contract", async () => {
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
                _channelManger, {
                    from: _rentalHost
                }
            );
            let rentalsCount = await factoryContract.rentalsCount();
            assert(rentalsCount.eq(1), "The rentals count was not correct");
        });

        it("should add correct rental contract address to the rentals mapping", async () => {
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
                _channelManger, {
                    from: _rentalHost
                }
            );
            let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
            let createdRentalId = await factoryContract.getRentalId(0);

            assert.strictEqual(createdRentalId, rentalIdHash, "The rentalId was not correct");
        });

        it("should add correct rentalId to the rentalIds array", async () => {
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
                _channelManger, {
                    from: _rentalHost
                }
            );
            let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
            let rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId, _marketplaceId);
            let rentalContractLocal = await IRental.at(rentalContractAddress);

            let result = await rentalContractLocal.getRental();

            assert.strictEqual(result[0], rentalIdHash, "The rentalId was not correct, not using correct address");
        });

        it("should set the values in a rental correctly", async function () {
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
                _channelManger, {
                    from: _rentalHost
                }
            );
            let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
            let rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId, _marketplaceId);
            let rentalContractLocal = await IRental.at(rentalContractAddress);

            let result = await rentalContractLocal.getRental();
            let rentalChannelManager = await rentalContractLocal.getChannelManager();

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
            assert.strictEqual(rentalChannelManager, _channelManger, "The rental channel manager was not set correctly");
        });

        it("should throw if trying to create rental when contract is paused", async function () {
            await factoryContract.pause({
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
                _channelManger, {
                    from: _rentalHost
                }
            ));
        });

        it("should throw if trying to create rental with already existing rentalId", async function () {
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
                _channelManger, {
                    from: _rentalHost
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
                _channelManger, {
                    from: _rentalHost
                }
            ));
        });

        it("should throw if trying to create rental without using marketplace contract", async function () {
            await expectThrow(factoryContract.createNewRental(
                _rentalId,
                _rentalHost,
                _defaultDailyRate,
                _weekendRate,
                _cleaningFee,
                _refundPercentages,
                _daysBeforeStartForRefund,
                _isInstantBooking,
                _deposit,
                _minNightsStay,
                _rentalTitle,
                _channelManger, {
                    from: _rentalHost
                }
            ));
        });

        it("should throw if trying to create rental with not approved marketplace", async function () {
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
                _channelManger, {
                    from: _rentalHost
                }
            ));
        });
    });

    describe("get rental data", () => {
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
                _channelManger, {
                    from: _rentalHost
                }
            );
        });

        it("should get correct rental count", async () => {
            let rentalsCount = await factoryContract.rentalsCount();
            assert(rentalsCount.eq(1), "The rentals count was not correct");

            await marketplaceContract.createRental(
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
                _channelManger, {
                    from: _rentalHost
                }
            );

            rentalsCount = await factoryContract.rentalsCount();
            assert(rentalsCount.eq(2), "The rentals count was not correct");
        });

        it("should get correct rentalId by array index", async function () {
            let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
            const resultRentalId = await factoryContract.getRentalId(0);
            assert.strictEqual(resultRentalId, rentalIdHash, "The rentalId for this index is incorrect");
        });

        it("should get correct rental contract address by rentalId", async function () {
            let rentalIdHash = await marketplaceContract.getRentalAndMarketplaceHash(_rentalId, _marketplaceId);
            const rentalContractAddress = await factoryContract.getRentalContractAddress(_rentalId, _marketplaceId);

            let rentalContract = await IRental.at(rentalContractAddress);
            let result = await rentalContract.getRental();
            assert.strictEqual(result[0], rentalIdHash, "The rentalId in this contract is incorrect");
        });
    });
});