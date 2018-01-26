const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const HotelRoomsProxy = artifacts.require('./Hotel/HotelRoomsProxy.sol')
const HotelRooms = artifacts.require('./Hotel/HotelRooms.sol')
const IHotelRooms = artifacts.require('./Hotel/IHotelRooms.sol')

const HotelRoomsUpgrade = artifacts.require('./TestContracts/HotelRoomsUpgrade/HotelRoomsUpgrade.sol')
const IHotelRoomsUpgrade = artifacts.require('./TestContracts/HotelRoomsUpgrade/IHotelRoomsUpgrade.sol')

const HotelFactoryProxy = artifacts.require('./Hotel/HotelFactory/HotelFactoryProxy.sol')
const HotelFactory = artifacts.require('./Hotel/HotelFactory/HotelFactory.sol')
const IHotelFactory = artifacts.require('./Hotel/HotelFactory/IHotelFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;
const getFutureTimestamp = util.getFutureTimestamp;

contract('HotelRooms', function (accounts) {
    let hotelContract;
    let hotelProxy;
    let hotelImpl;
    let hotelImpl2;

    let marketplaceProxy;
    let marketplaceImpl;
    let marketplaceContract;

    let factoryContract;
    let factoryProxy;
    let factoryImpl;

    const _owner = accounts[0];
    const _notOwner = accounts[1];
    const _marketplaceAdmin = accounts[2];
    const _hotelHost = accounts[3];
    const _hotelHostUpdate = accounts[4];

    const _hotelId = "testId123";
    const _hotelId2 = "testId223";
    const _marketplaceId = "ID123";
    const _marketplaceIdUpdate = "ID1234";
    const _workingDayPrice = '1000000000000000000';
    const _workingDayPriceUpdate = '2000000000000000000';
    const _roomsCount = 100;
    const _roomsCountUpdate = 300;
    const _roomsType = "single";
    const _roomsTypeUpdate = "double";
    const _arrayIndex = 1;

    const _url = "https://lockchain.co/marketplace";
    const _hotelAPI = "https://lockchain.co/hotelAPI";
    const _disputeAPI = "https://lockchain.co/DisuputeAPI";
    const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

    describe("Create new hotel with rooms", () => {
        beforeEach(async function () {
            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            hotelImpl = await HotelRooms.new();
            await hotelImpl.init();
            await marketplaceContract.init();

            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            await marketplaceContract.createMarketplace(
                _marketplaceId,
                _url,
                _hotelAPI,
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

        it("Should create new hotel rooms from Marketplace contract and hotel factory contract", async() => {
            let result = await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotels count was not correct");
        });

        it("should throw on creating second hotel in same contract", async() => {
            let result = await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            const hotelRoomsContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
            let hotelRoomsContract = await IHotelRooms.at(hotelRoomsContractAddress);

            await expectThrow(hotelRoomsContract.createHotelRooms(
                _hotelId2,
                _marketplaceId,
                _hotelHost,
                _roomsCount,
                _roomsType,
                _workingDayPrice,
                _arrayIndex,
                factoryContract.address, {
                    from: _hotelHost
                }
            ));
        });

        it("should throw on creating hotel with empty hotelId", async() => {
            await expectThrow(marketplaceContract.createHotelRooms(
                "",
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            ));
        });
    });

    describe("upgrade hotel contract", () => {
        beforeEach(async function () {
            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            hotelImpl = await HotelRooms.new();
            await hotelImpl.init();
            await marketplaceContract.init();

            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            await marketplaceContract.createMarketplace(
                _marketplaceId,
                _url,
                _hotelAPI,
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

        it("should change hotel implementation and keep storage", async() => {
            let result = await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotel rooms count was not correct");

            hotelImpl = await HotelRooms.new();
            await hotelImpl.init();

            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);

            hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotels count was not correct");
        });

        it("should change hotel implementation and add new function", async() => {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotels count was not correct");

            hotelImpl2 = await HotelRoomsUpgrade.new();
            await hotelImpl2.init();

            await factoryContract.setHotelRoomsImplAddress(hotelImpl2.address);
            let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
            let hotelContract = IHotelRoomsUpgrade.at(hotelContractAddress);

            await hotelContract.updateDayPrice(_workingDayPriceUpdate);
            let result = await hotelContract.getHotelRoom();
            assert.strictEqual(result[5].toString(), _workingDayPriceUpdate, "The cleaningFee was not set correctly");

            hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotels count was not correct");
        });

        it("should throw when using new function without upgrade", async() => {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );
            let hotelsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelsCount.eq(1), "The hotels count was not correct");

            let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
            let hotelContract = IHotelRoomsUpgrade.at(hotelContractAddress);

            await expectThrow(hotelContract.updateDayPrice(_workingDayPriceUpdate));
        });
    });
});