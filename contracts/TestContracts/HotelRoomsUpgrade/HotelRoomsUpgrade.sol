pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelRoomsUpgrade.sol";
import "./../../Property/Hotel/HotelFactory/IHotelFactory.sol";

/**
* @dev This contract is only used to test the upgreadability - DO NOT DEPLOY TO PRODUCTION
*/
contract HotelRoomsUpgrade is IHotelRoomsUpgrade, OwnableUpgradeableImplementation {
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
            uint _rentalArrayIndex,
            address _hotelFactoryContractAddress)
    {
        return (
            hotelId,
            marketplaceId,
            hostAddress,
            roomsCount,
            roomsType,
            workingDayPrice,
            rentalArrayIndex,
            hotelFactoryContractAddress
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

    function updateDayPrice(
        uint _newPrice
		) public returns(bool success)
	{
        workingDayPrice = _newPrice;
        
		return true;
	}

}