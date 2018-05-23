pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../Upgradeability/SharedStorage.sol";

contract IHotelReservation {

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);

	function createHotelReservation(
		bytes32 _hotelReservationId,
		address customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public returns (bool success);

	function getHotelReservation() public view 
	returns(
		bytes32 _hotelReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
		bytes32 _hotelId,
		bytes32 _roomId ,
		uint _numberOfTravelers,
		bool _isDisputeOpen);

	function validateCancelation(address _customerAddress) public view returns (bool success);
	function validateRefundForCreation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages, uint _startDate) public view returns (bool success);
	function getLocToBeRefunded() public view returns (uint _locToBeRefunded, uint _locRemainder);
	function getCustomerAddress() public view returns (address _customerAddress);
	function validateReservationForWithdraw() public view returns (bool success);
	function getLocForWithdraw() public view returns  (uint _locAmountForWithdraw);
	function getHotelReservationId() public view returns (bytes32 _hotelReservationId);
	function getHotelReservationCost() public view returns (uint _hotelReservationCostLOC);
	function validateDispute(address _customerAddress) public view returns (bool success);
	function getReservationDisputeStatus() public view returns (bool _isDisputeOpen);
	function setReservationDisputeStatus(bool _isDisputeOpen) public;
}