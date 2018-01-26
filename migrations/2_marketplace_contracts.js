let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");
let IMarketplace = artifacts.require("./../Marketplace/IMarketplace.sol");

let PropertyProxy = artifacts.require("./../Property/PropertyProxy.sol");
let Property = artifacts.require("./../Property/Property.sol");
let IProperty = artifacts.require("./../Property/IProperty.sol");

let PropertyFactoryProxy = artifacts.require("./../Property/PropertyFactory/PropertyFactoryProxy.sol");
let PropertyFactory = artifacts.require("./../Property/PropertyFactory/PropertyFactory.sol");
let IPropertyFactory = artifacts.require("./../Property/PropertyFactory/IPropertyFactory.sol");

let HotelRoomsProxy = artifacts.require("./../Hotel/HotelRoomsProxy.sol");
let HotelRooms = artifacts.require("./../Hotel/HotelRooms.sol");
let IHotelRooms = artifacts.require("./../Hotel/IHotelRooms.sol");

let HotelFactoryProxy = artifacts.require("./../Hotel/HotelFactory/HotelFactoryProxy.sol");
let HotelFactory = artifacts.require("./../Hotel/HotelFactory/HotelFactory.sol");
let IHotelFactory = artifacts.require("./../Hotel/HotelFactory/IHotelFactory.sol");

module.exports = async function (deployer) {
    // Property
    await deployer.deploy(Property);
    let PropertyImpl = await Property.deployed();
    await PropertyImpl.init();

    await deployer.deploy(PropertyFactory);
    let PropertyFactoryImpl = await PropertyFactory.deployed();
    await deployer.deploy(PropertyFactoryProxy, PropertyFactoryImpl.address);
    let PropertyFactoryContract = await PropertyFactoryProxy.deployed();
    PropertyFactoryContract = await IPropertyFactory.at(PropertyFactoryContract.address);

    // Hotel
    await deployer.deploy(HotelRooms);
    let HotelRoomsImpl = await HotelRooms.deployed();
    await HotelRoomsImpl.init();

    await deployer.deploy(HotelFactory);
    let HotelFactoryImpl = await HotelFactory.deployed();
    await deployer.deploy(HotelFactoryProxy, HotelFactoryImpl.address);
    let HotelFactoryContract = await HotelFactoryProxy.deployed();
    HotelFactoryContract = await IHotelFactory.at(HotelFactoryContract.address);

    // Marketplace
    await deployer.deploy(Marketplace);
    let MarketplaceImpl = await Marketplace.deployed();
    await deployer.deploy(MarketplaceProxy, MarketplaceImpl.address);
    let MarketplaceContract = await MarketplaceProxy.deployed();
    MarketplaceContract = await IMarketplace.at(MarketplaceContract.address);

    await PropertyFactoryContract.init();
    await HotelFactoryContract.init();
    await MarketplaceContract.init();

    await MarketplaceContract.setPropertyFactoryContract(PropertyFactoryContract.address);
    await MarketplaceContract.setHotelFactoryContract(HotelFactoryContract.address);

    await PropertyFactoryContract.setPropertyImplAddress(PropertyImpl.address);
    await PropertyFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    await PropertyFactoryContract.setMaxBookingPeriod(30);

    await HotelFactoryContract.setHotelRoomsImplAddress(HotelRoomsImpl.address);
    await HotelFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    await HotelFactoryContract.setMaxBookingPeriod(30);
};