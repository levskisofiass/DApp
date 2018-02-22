let MarketplaceProxy = artifacts.require("./../Marketplace/MarketplaceProxy.sol");
let Marketplace = artifacts.require("./../Marketplace/Marketplace.sol");
let IMarketplace = artifacts.require("./../Marketplace/IMarketplace.sol");

let RentalProxy = artifacts.require("./../Property/Rental/RentalProxy.sol");
let Rental = artifacts.require("./../Property/Rental/Rental.sol");
let IRental = artifacts.require("./../Property/Rental/IRental.sol");

let RentalFactoryProxy = artifacts.require("./../Property/Rental/RentalFactory/RentalFactoryProxy.sol");
let RentalFactory = artifacts.require("./../Property/Rental/RentalFactory/RentalFactory.sol");
let IRentalFactory = artifacts.require("./../Property/Rental/RentalFactory/IRentalFactory.sol");

let HotelRoomsProxy = artifacts.require("./../Property/Hotel/HotelRoomsProxy.sol");
let HotelRooms = artifacts.require("./../Property/Hotel/HotelRooms.sol");
let IHotelRooms = artifacts.require("./../Property/Hotel/IHotelRooms.sol");

let HotelFactoryProxy = artifacts.require("./../Property/Hotel/HotelFactory/HotelFactoryProxy.sol");
let HotelFactory = artifacts.require("./../Property/Hotel/HotelFactory/HotelFactory.sol");
let IHotelFactory = artifacts.require("./../Property/Hotel/HotelFactory/IHotelFactory.sol");

module.exports = async function (deployer) {
    // Rental
    await deployer.deploy(Rental);
    let RentalImpl = await Rental.deployed();
    await RentalImpl.init();

    await deployer.deploy(RentalFactory);
    let RentalFactoryImpl = await RentalFactory.deployed();
    await deployer.deploy(RentalFactoryProxy, RentalFactoryImpl.address);
    let RentalFactoryContract = await RentalFactoryProxy.deployed();
    RentalFactoryContract = await IRentalFactory.at(RentalFactoryContract.address);

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

    await RentalFactoryContract.init();
    await HotelFactoryContract.init();
    await MarketplaceContract.init();

    await MarketplaceContract.setRentalFactoryContract(RentalFactoryContract.address);
    await MarketplaceContract.setHotelFactoryContract(HotelFactoryContract.address);

    await RentalFactoryContract.setImplAddress(RentalImpl.address);
    await RentalFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    await RentalFactoryContract.setMaxBookingPeriod(30);

    await HotelFactoryContract.setImplAddress(HotelRoomsImpl.address);
    await HotelFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    await HotelFactoryContract.setMaxBookingPeriod(30);
};