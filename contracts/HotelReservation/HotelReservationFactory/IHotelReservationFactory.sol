pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationFactory is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);

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
	function cancelHotelReservation(bytes32 _hotelReservationId)  returns(bool success);
}
