let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let MarketplaceImpl = artifacts.require("./../Marketplace/MarketplaceImpl.sol");

module.exports = async function(deployer) {
    await deployer.deploy(MarketplaceImpl);
    let MarketplaceImplInstance = await MarketplaceImpl.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceImplInstance.address);   
};