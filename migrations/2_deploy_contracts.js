let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Marketplace);
    let MarketplaceInstance = await Marketplace.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceInstance.address);   
};