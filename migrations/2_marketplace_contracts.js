let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");
let IMarketplace = artifacts.require("./../Marketplace/IMarketplace.sol");

let PropertyProxy = artifacts.require("./../Property/PropertyProxy.sol");
let Property = artifacts.require("./../Property/Property.sol");
let IProperty = artifacts.require("./../Property/IProperty.sol");

module.exports = async function (deployer) {

    await deployer.deploy(Property);
    let PropertyImpl = await Property.deployed();
    await deployer.deploy(PropertyProxy, PropertyImpl.address);
    let PropertyContract = await PropertyProxy.deployed();
    PropertyContract = await IProperty.at(PropertyContract.address);
    await PropertyContract.init();

    await deployer.deploy(Marketplace);
    let MarketplaceImpl = await Marketplace.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceImpl.address);
    let MarketplaceContract = await MarketplaceProxy.deployed();
    MarketplaceContract = await IMarketplace.at(MarketplaceContract.address);
    await MarketplaceContract.init(PropertyContract.address);
    await PropertyContract.setMarketplace(MarketplaceContract.address);
};