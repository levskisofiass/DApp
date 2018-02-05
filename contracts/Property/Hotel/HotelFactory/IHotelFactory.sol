pragma solidity ^0.4.17;

import "./../../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../../../Lifecycle/IPausable.sol";
import "./../../PropertyFactory/IPropertyFactory.sol";


contract IHotelFactory is IOwnableUpgradeableImplementation, IPropertyFactory {
    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice) public returns(bool success);

    function validateCreate(
        bytes32 _hotelId,
        bytes32 _marketplaceId
    ) public returns(bool success);
    
    function hashHotelRoomTypePair(bytes32 _hotelId, bytes32 _roomsType) public pure returns(bytes32);

    function hotelRoomTypePairsCount() public constant returns(uint);

    function getHotelRoomTypePairId(uint index) public constant returns(bytes32);

    function getHotelRoomsContractAddress(bytes32 _hotelId, bytes32 _roomsType) public constant returns(address hotelContract);
}
