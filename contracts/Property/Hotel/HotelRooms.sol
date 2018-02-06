pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelRooms.sol";
import "./HotelFactory/IHotelFactory.sol";


contract HotelRooms is IHotelRooms, OwnableUpgradeableImplementation {
    bytes32 hotelId;
    bytes32 marketplaceId;
    address hostAddress;
    uint roomsCount;
    bytes32 roomsType;
    uint workingDayPrice;
    uint hotelArrayIndex;
    address hotelFactoryContractAddress;
    mapping (uint256 => uint256) public timestampPrices;

    event LogCreateHotel(bytes32 _hotel, address _hostAddress);    
    event LogSetPriceHotel(bytes32 _hotel, bytes32 _roomsType, uint256 _timestamp, uint256 _price);

    modifier onlyHost() {
        require(msg.sender == hostAddress);
        _;
    }

    modifier onlyValidHotel(bytes32 _hotelId) {
        require(_hotelId != "");
        _;
    }

    modifier onlyNewHotelRooms() {
        require(hotelId == "");
        _;
    }

    function getHotelRoom() public constant
        returns(
            bytes32 _hotelId,
            bytes32 _marketplaceId,
            address _hostAddress,
            uint _roomsCount,
            bytes32 _roomsType,
            uint _workingDayPrice,
            uint _hotelArrayIndex)
    {
        return (
            hotelId,
            marketplaceId,
            hostAddress,
            roomsCount,
            roomsType,
            workingDayPrice,
            hotelArrayIndex
        );
    }

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice,
        uint _hotelArrayIndex,
        address _hotelFactoryContractAddress
		) public onlyNewHotelRooms onlyValidHotel(_hotelId) returns(bool success)
	{
        hotelId = _hotelId;
        marketplaceId = _marketplaceId;
        hostAddress = _hostAddress;
        roomsCount = _roomsCount;
        roomsType = _roomsType;
        workingDayPrice = _workingDayPrice;
        hotelArrayIndex = _hotelArrayIndex;
        hotelFactoryContractAddress = _hotelFactoryContractAddress;
        LogCreateHotel(_hotelId, _hostAddress);
        
		return true;
	}

    function setPrice(
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _price
    ) public onlyHost returns(bool success) 
    {
        require(_timestampEnd >= _timestampStart);
        require(_timestampStart >= now);
        require(_price > 0);

        IHotelFactory hotelFactoryContract = IHotelFactory(hotelFactoryContractAddress);
        require((_timestampEnd - _timestampStart) <= hotelFactoryContract.getMaxBookingPeriod() * 1 days);

        for (uint day = _timestampStart; day <= _timestampEnd; (day += 1 days)) {
            timestampPrices[day] = _price;
            LogSetPriceHotel(hotelId, roomsType, day, _price);
        }

        return true;
    }


    function getPrice(uint256 _timestamp) public constant returns(uint256 price) {
        require(_timestamp > 0);

        if (timestampPrices[_timestamp] > 0) 
            return timestampPrices[_timestamp];
        else
            return workingDayPrice;
    }
}