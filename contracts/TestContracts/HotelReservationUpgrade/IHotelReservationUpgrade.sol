pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationUpgrade is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercantage,
		bytes32 _hotelId,
		bytes32 _roomId
	) public returns (bool success);

	function getHotelReservation() public constant 
	returns(
		bytes32 _hotelReservationId,
		address customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercantage,
		bytes32 _hotelId,
		bytes32 _roomId );


	function updateReservationCostLOC(uint _newPrice) public returns(bool success);
}