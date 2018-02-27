pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationFactory is IOwnableUpgradeableImplementation {

event LogCreateHotelReservation(bytes32 _hotelId, bytes32 _roomId);

    function setImplAddress(address implAddress) public;
    function getImplAddress() public constant returns(address implAddress);

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

	function getHotelReservationId(uint index) public constant returns(bytes32);
    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public constant returns(address hotelReservationContract);
	function getHotelReservationsCount() public constant returns(uint);

}
