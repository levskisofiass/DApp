pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationFactory is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _locRefundsRemainder);
event LogWithdrawal(bytes32 _hotelReservationId, uint _withdrawnAmount);

    function setImplAddress(address implAddress) public;
    function getImplAddress() public constant returns(address implAddress);

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercentage,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public returns (bool success);

	function getHotelReservationId(uint index) public constant returns(bytes32);
    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public constant returns(address hotelReservationContract);
	function getHotelReservationsCount() public constant returns(uint);

	function setLOCTokenContractAddress(address locTokenContractAddress) public;
	function cancelHotelReservation(bytes32 _hotelReservationId) returns(bool success);
	function withdraw(address[] _hotelReservations) returns(bool success);
	function getLocRemainderAmount() public constant returns(uint _locRefundsRemainder);
	function setWithdrawDestinationAddress(address _withdrawDestinationAddress);
	function setWithdrawerAddress(address _withdrawerAddress);
	function getWithdrawerAddress() returns(address _withdrawerAddress);
	function getWithdrawDestinationAddress() returns(address _withdrawDestinationAddress);
	function setCyclesCount(uint _cyclesCount);
}
