let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");

let PropertyProxy = artifacts.require("./../Property/PropertyProxy.sol");
let Property = artifacts.require("./../Property/Property.sol");

module.exports = async function (deployer) {

    await deployer.deploy(Property);
    let PropertyInstance = await Property.deployed();
    await deployer.deploy(PropertyProxy, PropertyInstance.address);
    await PropertyInstance.init();

    await deployer.deploy(Marketplace);
    let MarketplaceInstance = await Marketplace.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceInstance.address);
    await MarketplaceInstance.init(PropertyInstance.address);
};