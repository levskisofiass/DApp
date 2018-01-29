pragma solidity ^0.4.17;

import "./../HotelRoomsProxy.sol";
import "./../IHotelRooms.sol";
import "./IHotelFactory.sol";
import "./../../PropertyFactory/PropertyFactory.sol";


contract HotelFactory is IHotelFactory, PropertyFactory {
    bytes32[] public hotelRoomTypePairsIds;
    mapping (bytes32 => address) public hotelRoomTypePairs;

    event LogCreateHotelContract(bytes32 hotelid, address hostAddress, address hotelContract);
    event LogSetMaxBookingPeriod(uint256 period, address hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called for not existing hotelRoomTypePairs
     * @param _hotelRoomTypePairId - the identifier of the hotel
     */
    modifier onlyNotExisting(bytes32 _hotelRoomTypePairId) {
        require(hotelRoomTypePairs[_hotelRoomTypePairId] == address(0));
        _;
    }

    function hashHotelRoomTypePair(bytes32 _hotelId, bytes32 _roomsType) public pure returns(bytes32) {
        return keccak256(_hotelId, _roomsType);
    }

    function hotelRoomTypePairsCount() public constant returns(uint) {
        return hotelRoomTypePairsIds.length;
    }

    function getHotelRoomTypePairId(uint index) public constant returns(bytes32) {
        return hotelRoomTypePairsIds[index];
    }

    function getHotelRoomsContractAddress(bytes32 _hotelId, bytes32 _roomsType) public constant returns(address hotelContract) {
        bytes32 hotelRoomTypePairId = keccak256(_hotelId, _roomsType);
        return hotelRoomTypePairs[hotelRoomTypePairId];
    }

    function validateCreate(
        bytes32 _hotelRoomId,
        bytes32 _marketplaceId
    ) public 
        onlyNotExisting(_hotelRoomId)
        onlyMarketplace(_marketplaceId)
        onlyApprovedMarketplace(_marketplaceId)
        whenNotPaused
        returns(bool success) 
    {
        return true;
    }

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        address _hostAddress,
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice) public returns(bool success)
	{
        require(_hostAddress != address(0));
        bytes32 hotelRoomId = keccak256(_hotelId, _roomsType);
        
        validateCreate(hotelRoomId, _marketplaceId);

        HotelRoomsProxy proxy = new HotelRoomsProxy(this);
        IHotelRooms hotelRoomsContract = IHotelRooms(proxy);

        hotelRoomsContract.createHotelRooms(
            _hotelId,
            _marketplaceId, 
            _hostAddress,
            _roomsCount,
            _roomsType,
            _workingDayPrice,
            hotelRoomTypePairsIds.length,
            this
        );

		hotelRoomTypePairs[hotelRoomId] = hotelRoomsContract;
        hotelRoomTypePairsIds.push(hotelRoomId);

        LogCreateHotelContract(_hotelId, _hostAddress, hotelRoomsContract);
		return true;
	}
}