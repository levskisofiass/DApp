pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelRoomsUpgrade is IOwnableUpgradeableImplementation {
    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice,
        uint _propertyArrayIndex,
        address _hotelFactoryContractAddress
    ) public returns(bool success);

    function updateDayPrice(uint _dayPrice) public returns(bool success);

    function getHotelRoom() public constant
        returns(
            bytes32 _hotelId,
            bytes32 _marketplaceId,
            address _hostAddress,
            uint _roomsCount,
            bytes32 _roomsType,
            uint _workingDayPrice,
            uint _propertyArrayIndex,
            address _hotelFactoryContractAddress
        );
}
