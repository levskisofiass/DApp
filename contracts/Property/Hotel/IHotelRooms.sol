pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelRooms is IOwnableUpgradeableImplementation {

    event LogCreateHotel(bytes32 _hotel, address _hostAddress);    
    event LogSetPriceHotel(bytes32 _hotel, bytes32 _roomsType, uint256 _timestamp, uint256 _price);

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice,
        uint _hotelArrayIndex,
        address _hotelFactoryContractAddress
    ) public returns(bool success);

    function getHotelRoom() public constant
        returns(
            bytes32 _hotelId,
            bytes32 _marketplaceId,
            address _hostAddress,
            uint _roomsCount,
            bytes32 _roomsType,
            uint _workingDayPrice,
            uint _hotelArrayIndex
        );

    function setPrice(uint256 _timestampStart, uint256 _timestampEnd, uint256 _price) public returns(bool success);

    function getPrice(uint256 _timestamp) public constant returns(uint price);
}
