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
    uint rentalArrayIndex;
    address hotelFactoryContractAddress;
    mapping (uint256 => uint256) public timestampPrices;

    event LogCreateHotel(bytes32 _hotel, address _hostAddress);    

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
            uint _rentalArrayIndex)
    {
        return (
            hotelId,
            marketplaceId,
            hostAddress,
            roomsCount,
            roomsType,
            workingDayPrice,
            rentalArrayIndex
        );
    }

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice,
        uint _rentalArrayIndex,
        address _hotelFactoryContractAddress
		) public onlyNewHotelRooms onlyValidHotel(_hotelId) returns(bool success)
	{
        hotelId = _hotelId;
        marketplaceId = _marketplaceId;
        hostAddress = _hostAddress;
        roomsCount = _roomsCount;
        roomsType = _roomsType;
        workingDayPrice = _workingDayPrice;
        rentalArrayIndex = _rentalArrayIndex;
        hotelFactoryContractAddress = _hotelFactoryContractAddress;
        LogCreateHotel(_hotelId, _hostAddress);
        
		return true;
	}
}