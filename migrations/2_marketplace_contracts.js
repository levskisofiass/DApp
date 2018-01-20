let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");
let IMarketplace = artifacts.require("./../Marketplace/IMarketplace.sol");

let PropertyProxy = artifacts.require("./../Property/PropertyProxy.sol");
let Property = artifacts.require("./../Property/Property.sol");
let IProperty = artifacts.require("./../Property/IProperty.sol");

let PropertyFactoryProxy = artifacts.require("./../Property/PropertyFactory/PropertyFactoryProxy.sol");
let PropertyFactory = artifacts.require("./../Property/PropertyFactory/PropertyFactory.sol");
let IPropertyFactory = artifacts.require("./../Property/PropertyFactory/IPropertyFactory.sol");

module.exports = async function (deployer) {
    await deployer.deploy(Property);
    let PropertyImpl = await Property.deployed();
    await PropertyImpl.init();

    await deployer.deploy(PropertyFactory);
    let PropertyFactoryImpl = await PropertyFactory.deployed();
    await deployer.deploy(PropertyFactoryProxy, PropertyFactoryImpl.address);
    let PropertyFactoryContract = await PropertyFactoryProxy.deployed();
    PropertyFactoryContract = await IPropertyFactory.at(PropertyFactoryContract.address);

    await deployer.deploy(Marketplace);
    let MarketplaceImpl = await Marketplace.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceImpl.address);
    let MarketplaceContract = await MarketplaceProxy.deployed();
    MarketplaceContract = await IMarketplace.at(MarketplaceContract.address);

    await PropertyFactoryContract.init();
    await MarketplaceContract.init(PropertyFactoryContract.address);

    await PropertyFactoryContract.setPropertyImplAddress(PropertyImpl.address);
    await PropertyFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    await PropertyFactoryContract.setMaxBookingPeriod(30);
};