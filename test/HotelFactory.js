const web3 = require("web3");

const MarketplaceProxy = artifacts.require("./Marketplace/MarketplaceProxy.sol");
const Marketplace = artifacts.require("./Marketplace/Marketplace.sol");
const IMarketplace = artifacts.require("./Marketplace/IMarketplace.sol");

const HotelProxy = artifacts.require('./Hotel/HotelRoomsProxy.sol')
const Hotel = artifacts.require('./Hotel/HotelRooms.sol')
const IHotel = artifacts.require('./Hotel/IHotelRooms.sol')

const HotelFactoryProxy = artifacts.require('./Hotel/HotelFactory/HotelFactoryProxy.sol')
const HotelFactory = artifacts.require('./Hotel/HotelFactory/HotelFactory.sol')
const IHotelFactory = artifacts.require('./Hotel/HotelFactory/IHotelFactory.sol')

const IOwnableUpgradeableImplementation = artifacts.require("./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol");
const util = require('./util');
const expectThrow = util.expectThrow;

contract('hotel factory', function (accounts) {
    let factoryContract;
    let factoryProxy;
    let factoryImpl;
    let factoryImpl2;
    let hotelImpl;
    let hotelImpl2;

    let marketplaceProxy;
    let marketplaceImpl;
    let marketplaceContract;

    const _owner = accounts[0];
    const _notOwner = accounts[1];
    const _marketplaceAdmin = accounts[2];
    const _hotelHost = accounts[3];

    const _hotelId = "testId123";
    const _hotelId2 = "testId223";
    const _marketplaceId = "ID123";
    const _workingDayPrice = '1000000000000000000';
    const _roomsCount = "100";
    const _roomsCountUpdate = "300";
    const _roomsType = "single";
    const _roomsTypeUpdate = "double";

    const _url = "https://lockchain.co/marketplace";
    const _hotelAPI = "https://lockchain.co/hotelAPI";
    const _disputeAPI = "https://lockchain.co/DisuputeAPI";
    const _exchangeContractAddress = "0x2988ae7f92f5c8cad1997ae5208aeaa68878f76d";

    describe("creating hotel factory proxy", () => {
        beforeEach(async function () {
            hotelImpl = await Hotel.new();
            await hotelImpl.init();

            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
        });

        it("should get the owner of the first contract", async function () {
            const owner = await factoryContract.getOwner();
            assert.strictEqual(owner, _owner, "The owner is not set correctly");
        });
    });

    describe("upgrade hotel factory contract", () => {
        beforeEach(async function () {
            hotelImpl = await Hotel.new();
            await hotelImpl.init();

            factoryImpl = await HotelFactory.new();
            factoryImpl2 = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
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

    describe("change hotel implementation", () => {
        beforeEach(async function () {
            hotelImpl = await Hotel.new();
            await hotelImpl.init();

            factoryImpl = await HotelFactory.new();
            factoryImpl2 = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
        });

        it("should set correct hotel implementation", async function () {
            const hotelImplAddress = await factoryContract.getHotelRoomsImplAddress();
            assert.strictEqual(hotelImplAddress, hotelImpl.address, "The hotel implementation is not set correctly");
        });

        it("should change hotel implementation", async function () {
            hotelImpl2 = await Hotel.new();
            await hotelImpl2.init();
            await factoryContract.setHotelRoomsImplAddress(hotelImpl2.address);
            const hotelImplAddress = await factoryContract.getHotelRoomsImplAddress();

            assert.strictEqual(hotelImpl2.address, hotelImplAddress, "The hotel implementation is not set correctly");
        });

        it("should throw on change hotel implementation address from non-owner", async() => {
            hotelImpl2 = await Hotel.new();
            await hotelImpl2.init();
            await expectThrow(
                factoryContract.setHotelRoomsImplAddress(hotelImpl2.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("change marketplace contract address", () => {
        beforeEach(async function () {
            hotelImpl = await Hotel.new();
            await hotelImpl.init();

            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init()
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init();
            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
        });

        it("should set correct marketplace address", async function () {
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            const marketplaceAddress = await factoryContract.getMarketplaceAddress();
            assert.strictEqual(marketplaceAddress, marketplaceContract.address, "The marketplace address is not set correctly");
        });

        it("should change marketplace address", async function () {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init();
            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);

            const marketplaceAddress = await factoryContract.getMarketplaceAddress();

            assert.strictEqual(marketplaceContract.address, marketplaceAddress, "The marketplace address is not set correctly");
        });

        it("should throw on change marketplace address from non-owner", async() => {
            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            await marketplaceContract.init();
            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
            await expectThrow(
                factoryContract.setMarketplaceAddress(marketplaceContract.address, {
                    from: _notOwner
                })
            );
        });
    });

    describe("create new hotel", () => {
        beforeEach(async function () {
            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            hotelImpl = await Hotel.new();
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

        it("should create new hotel from Marketplace contract and hotel factory contract", async() => {
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

        it("should add correct hotel contract address to the hotels mapping", async() => {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let createdHotelId = await factoryContract.getHotelRoomTypePairId(0);
            let hotelRoomsHash = await factoryContract.hashHotelRoomTypePair(_hotelId, _roomsType);

            assert.strictEqual(createdHotelId, hotelRoomsHash, "The hotelId was not correct");
        });

        it("should add correct hotelId to the hotelIds array", async() => {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
            let hotelContractLocal = await IHotel.at(hotelContractAddress);

            let result = await hotelContractLocal.getHotelRoom();

            assert.strictEqual(web3.utils.hexToUtf8(result[0]), _hotelId, "The hotelId was not correct, not using correct address");
        });

        it("should set the values in a hotel correctly", async function () {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            let hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);
            let hotelContractLocal = await IHotel.at(hotelContractAddress);

            let result = await hotelContractLocal.getHotelRoom();
            assert.strictEqual(web3.utils.hexToUtf8(result[0]), _hotelId, "The hotelId was not set correctly");
            assert.strictEqual(web3.utils.hexToUtf8(result[1]), _marketplaceId, "The marketplaceId was not set correctly");
            assert.strictEqual(result[2], _hotelHost, "The host was not set correctly");
            assert.strictEqual(result[3].toString(), _roomsCount, "The roomsCount was not set correctly");
            assert.strictEqual(web3.utils.hexToUtf8(result[4]), _roomsType, "The roomsType was not set correctly");
            assert.strictEqual(result[5].toString(), _workingDayPrice, "The workingDayPrice was not set correctly");
            assert(result[6].eq(0), "The arrayIndex was not set correctly");
        });

        it("should throw if trying to create hotel when contract is paused", async function () {
            await factoryContract.pause({
                from: _owner
            });

            await expectThrow(marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            ));
        });

        it("should throw if trying to create hotel with already existing hotelId", async function () {
            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            await expectThrow(marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            ));
        });

        it("should throw if trying to create hotel without using marketplace contract", async function () {
            await expectThrow(factoryContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _hotelHost,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            ));
        });

        it("should throw if trying to create hotel with not approved marketplace", async function () {
            await marketplaceContract.rejectMarketplace(
                _marketplaceId, {
                    from: _owner
                }
            );

            await expectThrow(marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            ));
        });
    });

    describe("get hotel data", () => {
        beforeEach(async function () {
            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            hotelImpl = await Hotel.new();
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

            await marketplaceContract.createHotelRooms(
                _hotelId,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );
        });

        it("should get correct hotel count", async() => {
            let hotelRoomsPairsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelRoomsPairsCount.eq(1), "The hotels count was not correct");

            await marketplaceContract.createHotelRooms(
                _hotelId2,
                _marketplaceId,
                _roomsCount,
                _roomsType,
                _workingDayPrice, {
                    from: _hotelHost
                }
            );

            hotelRoomsPairsCount = await factoryContract.hotelRoomTypePairsCount();
            assert(hotelRoomsPairsCount.eq(2), "The hotels count was not correct");
        });

        it("should get correct hotelId by array index", async function () {
            const resultHotelId = await factoryContract.getHotelRoomTypePairId(0);
            let hotelRoomsHash = await factoryContract.hashHotelRoomTypePair(_hotelId, _roomsType);

            assert.strictEqual(resultHotelId, hotelRoomsHash, "The hotelRoomsId for this index is incorrect");
        });

        it("should get correct hotel contract address by hotelId", async function () {
            const hotelContractAddress = await factoryContract.getHotelRoomsContractAddress(_hotelId, _roomsType);

            let hotelContract = await IHotel.at(hotelContractAddress);
            let result = await hotelContract.getHotelRoom();
            assert.strictEqual(web3.utils.hexToUtf8(result[0]), _hotelId, "The hotelId in this contract is incorrect");
        });
    });

    describe("Booking Days Period", () => {
        let maxPeriodDays = 30 * 24 * 60 * 1000;
        beforeEach(async function () {
            factoryImpl = await HotelFactory.new();
            factoryProxy = await HotelFactoryProxy.new(factoryImpl.address);
            factoryContract = await IHotelFactory.at(factoryProxy.address);
            await factoryContract.init();

            marketplaceImpl = await Marketplace.new();
            marketplaceProxy = await MarketplaceProxy.new(marketplaceImpl.address);
            marketplaceContract = await IMarketplace.at(marketplaceProxy.address);

            hotelImpl = await Hotel.new();
            await hotelImpl.init();

            await marketplaceContract.init();
            await marketplaceContract.setHotelFactoryContract(factoryContract.address);
            await factoryContract.setHotelRoomsImplAddress(hotelImpl.address);
            await factoryContract.setMarketplaceAddress(marketplaceContract.address);
        });

        it("should set max booking days period", async() => {
            await factoryContract.setMaxBookingPeriod(maxPeriodDays);
            let period = await factoryContract.getMaxBookingPeriod();
            assert(period.eq(maxPeriodDays), "period was not correct set");
        });

        it("should throw on max booking days period = 0", async() => {
            await expectThrow(
                factoryContract.setMaxBookingPeriod(0)
            );
        });

        it("should throw on set max booking days period from non-owner", async() => {
            await expectThrow(
                factoryContract.setMaxBookingPeriod(maxPeriodDays, {
                    from: _notOwner
                })
            );
        });
    });
});