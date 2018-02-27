pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservation is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelId, bytes32 _roomId);

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
	) public returns (bool success);
}