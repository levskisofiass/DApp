pragma solidity ^0.4.17;

import "./../HotelReservationProxy.sol";
import "./../IHotelReservation.sol";
import "./IHotelReservationFactory.sol";
import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";

contract HotelReservationFactory is IHotelReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	bytes32[] public hotelReservationIds;
    mapping (bytes32 => address) public hotelReservations;
	 

	event LogCreateHotelReservation(bytes32 _hotelId, bytes32 _roomId);

	function setImplAddress(address implAddress) public onlyOwner {
        implContract = implAddress;
    }

    function getImplAddress() public constant returns(address implAddress) {
        return implContract;
    }

	 function getHotelReservationId(uint index) public constant returns(bytes32) {
        return hotelReservationIds[index];
    }

    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public constant returns(address hotelReservationContract) {
        return hotelReservations[_hotelReservationId];
    }

	function getHotelReservationsCount() public constant returns(uint) {
		return hotelReservationIds.length;
	}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercantage,
		bytes32 _hotelId,
		bytes32 _roomId
	) public returns(bool success)
	{

		HotelReservationProxy proxy = new HotelReservationProxy(this);
        IHotelReservation hotelReservationContract = IHotelReservation(proxy);

		hotelReservationContract.createHotelReservation(
		 _hotelReservationId,
		 _customerAddress,
		 _reservationCostLOC,
		 _reservationStartDate,
		 _reservationEndDate,
		 _daysBeforeStartForRefund,
		 _refundPercantage,
		 _hotelId,
		 _roomId
		);

	hotelReservations[_hotelReservationId] = hotelReservationContract;
    hotelReservationIds.push(_hotelReservationId);

	LogCreateHotelReservation(_hotelId, _roomId);
	return true;
	}
}