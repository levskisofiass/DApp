// const web3 = require("web3");
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


let HotelReservationProxy = artifacts.require("./../HotelReservation/HotelReservationProxy.sol");
let HotelReservation = artifacts.require("./../HotelReservation/HotelReservation.sol");
let IHotelReservation = artifacts.require("./../HotelReservation/IHotelReservation.sol");

let HotelReservationFactoryProxy = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactoryProxy.sol");
let HotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/HotelReservationFactory.sol");
let IHotelReservationFactory = artifacts.require("./../HotelReservation/HotelReservationFactory/IHotelReservationFactory.sol");

var ExchangeOracle = artifacts.require("./Exchange/ExchangeOracle.sol");
var LOCExchange = artifacts.require("./Exchange/LOCExchange.sol");
var MintableToken = artifacts.require("./Tokens/MintableToken.sol");


module.exports = async function (deployer, network, accounts) {

    const initialRate = 200;
    //This is calculated based on gas estimation for transactions
    const cyclesCountForWithdraw = 70;

    // TODO should remove the addresses when deploing on main net
    let account1 = '0x919df2d59d0667764bfe25ecf2a457bef0156a94';
    let account2 = '0x7767e15abf2fd17bce0acfc834155182e56bb313';
    let account3 = '0x2B8e7487CdACC95889252FC77b5E8E757aF666E6';
    let account4 = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    let account5 = '0x6524083c3a4b06cac3bb2d13c7c2bc3aeb50c680';
    let ropstenAcc = '0xB63dF2068d209F8Ff3925C4c9DbBAbfD31301825';
    let lockchainAcc = '0x264c1431983866d7626d7899638de183e60e6ad1';
    let testRpcAccount = accounts[3];

    let ERC20Instance;
    let ExchangeOracleInstance
    let LOCExchangeInstance;

    // Rental
    // await deployer.deploy(Rental);
    // let RentalImpl = await Rental.deployed();
    // await RentalImpl.init();

    // await deployer.deploy(RentalFactory);
    // let RentalFactoryImpl = await RentalFactory.deployed();
    // await deployer.deploy(RentalFactoryProxy, RentalFactoryImpl.address);
    // let RentalFactoryContract = await RentalFactoryProxy.deployed();
    // RentalFactoryContract = await IRentalFactory.at(RentalFactoryContract.address);

    // // Hotel
    // await deployer.deploy(HotelRooms);
    // let HotelRoomsImpl = await HotelRooms.deployed();
    // await HotelRoomsImpl.init();

    // await deployer.deploy(HotelFactory);
    // let HotelFactoryImpl = await HotelFactory.deployed();
    // await deployer.deploy(HotelFactoryProxy, HotelFactoryImpl.address);
    // let HotelFactoryContract = await HotelFactoryProxy.deployed();
    // HotelFactoryContract = await IHotelFactory.at(HotelFactoryContract.address);

    // // Marketplace
    // await deployer.deploy(Marketplace);
    // let MarketplaceImpl = await Marketplace.deployed();
    // await deployer.deploy(MarketplaceProxy, MarketplaceImpl.address);
    // let MarketplaceContract = await MarketplaceProxy.deployed();
    // MarketplaceContract = await IMarketplace.at(MarketplaceContract.address);

    //Hotel Reservation

    await deployer.deploy(HotelReservation);
    let HotelReservationImpl = await HotelReservation.deployed();

    await deployer.deploy(HotelReservationFactory);
    let HotelReservationFactoryImpl = await HotelReservationFactory.deployed();

    await deployer.deploy(HotelReservationFactoryProxy, HotelReservationFactoryImpl.address);
    let HotelReservationFactoryContract = await HotelReservationFactoryProxy.deployed();
    HotelReservationFactoryContract = await IHotelReservationFactory.at(HotelReservationFactoryContract.address);


    await HotelReservationFactoryContract.init();
    // await RentalFactoryContract.init();
    // await HotelFactoryContract.init();
    // await MarketplaceContract.init();

    // await MarketplaceContract.setRentalFactoryContract(RentalFactoryContract.address);
    // await MarketplaceContract.setHotelFactoryContract(HotelFactoryContract.address);

    // await RentalFactoryContract.setImplAddress(RentalImpl.address);
    // await RentalFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    // await RentalFactoryContract.setMaxBookingPeriod(30);

    // await HotelFactoryContract.setImplAddress(HotelRoomsImpl.address);
    // await HotelFactoryContract.setMarketplaceAddress(MarketplaceContract.address);
    // await HotelFactoryContract.setMaxBookingPeriod(30);

    await HotelReservationFactoryContract.setImplAddress(HotelReservationImpl.address);

    //TODO When deploiyng on main net we should remove the token
    //===========================================================================
    // Token
    await deployer.deploy(MintableToken);
    ERC20Instance = await MintableToken.deployed();

    //===========================================================================

    // Oracle
    await deployer.deploy(ExchangeOracle, initialRate);
    ExchangeOracleInstance = await ExchangeOracle.deployed();

    // Exchange 
    await deployer.deploy(LOCExchange, ExchangeOracleInstance.address, ERC20Instance.address); // ropsten - 0x13615ed1479b61751ce56189839f3a126e3847a9
    LOCExchangeInstance = await LOCExchange.deployed();

    await HotelReservationFactoryContract.setLOCTokenContractAddress(ERC20Instance.address);
    await HotelReservationFactoryContract.setmaxAllowedWithdrawCyclesCount(cyclesCountForWithdraw);
    await HotelReservationFactoryContract.setDisputeDestinationAddress(accounts[0]);

    await ERC20Instance.mint(account1, 200000000000000000000000);
    await ERC20Instance.mint(account2, 200000000000000000000000);
    await ERC20Instance.mint(account3, 400000000000000000000000000);
    await ERC20Instance.mint(account4, 200000000000000000000000);
    await ERC20Instance.mint(account5, 200000000000000000000000);
    await ERC20Instance.mint(ropstenAcc, 400000000000000000000000000);
    await ERC20Instance.mint(lockchainAcc, 200000000000000000000000);
    await ERC20Instance.mint(accounts[0], 400000000000000000000000);
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: LOCExchangeInstance.address,
        value: 3000000000000000000

    });
    await web3.eth.sendTransaction({
        from: accounts[0],
        to: account5,
        value: 3000000000000000000

    });

};