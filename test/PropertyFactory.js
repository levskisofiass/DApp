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
    let proxy;
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

    xdescribe("creating property factory proxy", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            factoryImpl = await PropertyFactory.new();
            proxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(proxy.address);
            await factoryContract.init(propertyImpl.address);
        });

        it("should get the owner of the first contract", async function () {
            const owner = await factoryContract.getOwner();
            assert.strictEqual(owner, _owner, "The owner is not set correctly");
        });
    });

    xdescribe("upgrade property factory contract", () => {
        beforeEach(async function () {
            propertyImpl = await Property.new();
            factoryImpl = await PropertyFactory.new();
            factoryImpl2 = await PropertyFactory.new();
            proxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(proxy.address);
            await factoryContract.init(propertyImpl.address);
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
            factoryImpl = await PropertyFactory.new();
            proxy = await PropertyFactoryProxy.new(factoryImpl.address);
            factoryContract = await IPropertyFactory.at(proxy.address);
            await factoryContract.init(propertyImpl.address);
        });

        it("should set correct property implementation", async function () {
            const propertyImplAddress = await factoryContract.getPropertyImpl();
            assert.strictEqual(propertyImplAddress, propertyImpl.address, "The property implementation is not set correctly");
        });

        it("should change property implementation", async function () {
            propertyImpl2 = await Property.new();
            await factoryContract.setPropertyImpl(propertyImpl2.address);
            const propertyImplAddress = await factoryContract.getPropertyImpl();

            assert.strictEqual(propertyImpl2.address, propertyImplAddress, "The property implementation is not set correctly");
        });
    });

    describe("create new Property", () => {
        beforeEach(async function () {
            impl = await Property.new();
            proxy = await PropertyProxy.new(impl.address);
            PropertyContract = await IProperty.at(proxy.address);
            await PropertyContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);
            await marketplaceContract.init(PropertyContract.address);

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

        it("should throw on create new Property without Marketplace contract", async() => {
            await expectThrow(PropertyContract.create(
                _propertyId,
                _marketplaceId,
                _owner,
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

        it("should throw if trying to create Property when paused", async function () {

            await PropertyContract.pause({
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

        it("should throw if the same PropertyId is used twice", async function () {

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

        it("should throw when marketplace is reject", async function () {

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
    });
});