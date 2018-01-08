const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const PropertyProxy = artifacts.require('./Property/PropertyProxy.sol')
const Property = artifacts.require('./Property/Property.sol')
const IProperty = artifacts.require('./Property/IProperty.sol')

const PropertyFactoryProxy = artifacts.require('./Property/PropertyFactory/PropertyFactoryProxy.sol')
const PropertyFactory = artifacts.require('./Property/PropertyFactory/PropertyFactory.sol')
const IPropertyFactory = artifacts.require('./Property/PropertyFactory/IPropertyFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('Property factory', function (accounts) {
    let factoryContract;
    let factoryProxy;
    let factoryImpl;
    let factoryImpl2;
    let propertyImpl;
    let propertyImpl2;

    let marketplaceProxy;
    let marketplaceImpl;
    let marketplaceContract;

    const _owner = accounts[0];
    const _notOwner = accounts[1];
    const _marketplaceAdmin = accounts[2];
    const _propertyHost = accounts[3];

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

    describe("creating property factory proxy", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            await propertyImpl.init();

            factoryImpl = await PropertyFactory.new();
            factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setPropertyImplAddress(propertyImpl.address);
        });

        it("should get the owner of the first contract", async function () {
            const owner = await factoryContract.getOwner();
            assert.strictEqual(owner, _owner, "The owner is not set correctly");
        });
    });

    describe("upgrade property factory contract", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            await propertyImpl.init();

            factoryImpl = await PropertyFactory.new();
            factoryImpl2 = await PropertyFactory.new();
            factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setPropertyImplAddress(propertyImpl.address);
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

    describe("change property implementation", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            await propertyImpl.init();

            factoryImpl = await PropertyFactory.new();
            factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(factoryProxy.address);
            await factoryContract.init()
            await factoryContract.setPropertyImplAddress(propertyImpl.address);
        });

        it("should set correct property implementation", async function () {
            const propertyImplAddress = await factoryContract.getPropertyImplAddress();
            assert.strictEqual(propertyImplAddress, propertyImpl.address, "The property implementation is not set correctly");
        });

        it("should change property implementation", async function () {
            propertyImpl2 = await Property.new();
            await propertyImpl2.init();
            await factoryContract.setPropertyImplAddress(propertyImpl2.address);
            const propertyImplAddress = await factoryContract.getPropertyImplAddress();

            assert.strictEqual(propertyImpl2.address, propertyImplAddress, "The property implementation is not set correctly");
        });

        it("should throw on change property implementation address from non-owner", async() => {
            propertyImpl2 = await Property.new();
            await propertyImpl2.init();
            await expectThrow(
                factoryContract.setPropertyImplAddress(propertyImpl2.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("change marketplace contract address", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            await propertyImpl.init();

            factoryImpl = await PropertyFactory.new();
            factoryProxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(factoryProxy.address);
            await factoryContract.init()
            await factoryContract.setPropertyImplAddress(propertyImpl.address);

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init(factoryContract.address);
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

            await marketplaceContract.init(factoryContract.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            const marketplaceAddress = await factoryContract.getMarketplaceAddress();

            assert.strictEqual(marketplaceContract.address, marketplaceAddress, "The marketplace address is not set correctly");
        });

        it("should throw on change marketplace address from non-owner", async() => {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init(factoryContract.address);
            await expectThrow(
                factoryContract.setMarketplaceAddress(marketplaceContract.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("[TODO - add more tests] create new property", () => {
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

            await marketplaceContract.init(factoryContract.address);
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

        it("should create new Property from Marketplace contract and Property factory contract", async() => {
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
            let propertiesCount = await factoryContract.propertiesCount();
            assert(propertiesCount.eq(1), "The properties count was not correct");
        });

        // it("should throw on create new Property without Marketplace contract", async() => {
        //     await expectThrow(PropertyContract.create(
        //         _propertyId,
        //         _marketplaceId,
        //         _owner,
        //         _workingDayPrice,
        //         _nonWorkingDayPrice,
        //         _cleaningFee,
        //         _refundPercent,
        //         _daysBeforeStartForRefund,
        //         _isInstantBooking, {
        //             from: _propertyHost
        //         }
        //     ));
        // });

        // it("should throw if trying to create Property when paused", async function () {

        //     await PropertyContract.pause({
        //         from: _owner
        //     });

        //     await expectThrow(marketplaceContract.createProperty(
        //         _propertyId,
        //         _marketplaceId,
        //         _workingDayPrice,
        //         _nonWorkingDayPrice,
        //         _cleaningFee,
        //         _refundPercent,
        //         _daysBeforeStartForRefund,
        //         _isInstantBooking, {
        //             from: _propertyHost
        //         }
        //     ));
        // });

        // it("should throw if the same PropertyId is used twice", async function () {

        //     await marketplaceContract.createProperty(
        //         _propertyId,
        //         _marketplaceId,
        //         _workingDayPrice,
        //         _nonWorkingDayPrice,
        //         _cleaningFee,
        //         _refundPercent,
        //         _daysBeforeStartForRefund,
        //         _isInstantBooking, {
        //             from: _propertyHost
        //         }
        //     );

        //     await expectThrow(marketplaceContract.createProperty(
        //         _propertyId,
        //         _marketplaceId,
        //         _workingDayPrice,
        //         _nonWorkingDayPrice,
        //         _cleaningFee,
        //         _refundPercent,
        //         _daysBeforeStartForRefund,
        //         _isInstantBooking, {
        //             from: _propertyHost
        //         }
        //     ));
        // });

        // it("should throw when marketplace is reject", async function () {

        //     await marketplaceContract.rejectMarketplace(
        //         _marketplaceId, {
        //             from: _owner
        //         }
        //     );

        //     await expectThrow(marketplaceContract.createProperty(
        //         _propertyId,
        //         _marketplaceId,
        //         _workingDayPrice,
        //         _nonWorkingDayPrice,
        //         _cleaningFee,
        //         _refundPercent,
        //         _daysBeforeStartForRefund,
        //         _isInstantBooking, {
        //             from: _propertyHost
        //         }
        //     ));
        // });
    });

    describe("get property data", () => {
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

            await marketplaceContract.init(factoryContract.address);
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

        it("should get correct property count", async() => {
            let propertiesCount = await factoryContract.propertiesCount();
            assert(propertiesCount.eq(1), "The properties count was not correct");

            await marketplaceContract.createProperty(
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

            propertiesCount = await factoryContract.propertiesCount();
            assert(propertiesCount.eq(2), "The properties count was not correct");
        });

        it("should get correct propertyId by array index", async function () {
            const resultPropertyId = await factoryContract.getPropertyId(0);
            assert.strictEqual(web3.utils.hexToUtf8(resultPropertyId), _propertyId, "The propertyId for this index is incorrect");
        });

        it("should get correct property contract address by propertyId", async function () {
            const propertyContractAddress = await factoryContract.getPropertyContractAddress(_propertyId);

            let propertyContract = await IProperty.at(propertyContractAddress);
            let result = await propertyContract.getProperty();
            assert.strictEqual(web3.utils.hexToUtf8(result[0]), _propertyId, "The propertyId in this contract is incorrect");
        });

        it("should throw on change marketplace address from non-owner", async() => {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init(factoryContract.address);
            await expectThrow(
                factoryContract.setMarketplaceAddress(marketplaceContract.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("Booking Days Interval", () => {
        let maxIntervalDays = 30 * 24 * 60 * 1000;
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

            await marketplaceContract.init(factoryContract.address);
            await factoryContract.setPropertyImplAddress(propertyImpl.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);
        });

        it("should set max booking days interval", async() => {
            await factoryContract.setMaxBookingDaysInterval(maxIntervalDays);
            let interval = await factoryContract.getMaxBookingDaysInterval();
            assert(interval.eq(maxIntervalDays), "interval was not correct set");
        });

        it("should throw on max booking days interval = 0", async() => {
            await expectThrow(
                factoryContract.setMaxBookingDaysInterval(0)
            );
        });

        it("should throw on set max booking days interval from non-owner", async() => {
            await expectThrow(
                factoryContract.setMaxBookingDaysInterval(maxIntervalDays, {
                    from: _notOwner
                })
            );
        });
    });
});