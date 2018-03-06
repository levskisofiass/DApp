pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationUpgrade is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);

	function createHotelReservation(
		bytes32 _hotelReservationId,
		address customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercentage,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public returns (bool success);

	function getHotelReservation() public constant 
	returns(
		bytes32 _hotelReservationId,
		address customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercentage,
		bytes32 _hotelId,
		bytes32 _roomId ,
		uint _numberOfTravelers);

	function cancelHotelReservation(bytes32 _hotelReservationId)  returns(bool success);
	function validateCancelation(address _customerAddress);
	function getLocToBeRefunded() public constant returns (uint _locToBeRefunded, uint _locRemainder);
	function getCustomerAddress() public constant returns (address _customerAddress);
	function validatePeriodForWithdraw();
	function getLocForWithdraw() returns (uint _locAmountForWithdraw);
	function getHotelReservationId() returns (bytes32 _hotelReservationId);

	function updateReservationCostLOC(uint _newPrice) public returns(bool success);
}