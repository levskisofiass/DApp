pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IHotelReservationFactory is IOwnableUpgradeableImplementation {

	address public implContract;
	address public withdrawerAddress;
	address public withdrawDestinationAddress;
	bytes32[] public hotelReservationIds;
	uint public locRefundsRemainder;
	uint public maxAllowedWithdrawCyclesCount;

event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _locRefundsRemainder);
event LogWithdrawal(bytes32 _hotelReservationId, uint _withdrawnAmount);

    function setImplAddress(address implAddress) public;
    function getImplAddress() public view returns(address implAddress);

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public returns (bool success);

	function getHotelReservationId(uint index) public view returns(bytes32 _hotelReservaionId);
    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public view returns(address hotelReservationContract);
	function getHotelReservationsCount() public view returns(uint _hotelReservationCount);

	function setLOCTokenContractAddress(address locTokenContractAddress) public;
	function cancelHotelReservation(bytes32 _hotelReservationId) returns(bool success);
	function withdraw(address[] _hotelReservations) returns(bool success);
	function getLocRemainderAmount() public view returns(uint _locRefundsRemainder);
	function setWithdrawDestinationAddress(address _withdrawDestinationAddress) public;
	function setWithdrawerAddress(address _withdrawerAddress) public;
	function getWithdrawerAddress() public view returns(address _withdrawerAddress);
	function getWithdrawDestinationAddress() public view returns(address _withdrawDestinationAddress);
	function setmaxAllowedWithdrawCyclesCount(uint _maxAllowedWithdrawCyclesCount);
	function getmaxAllowedWithdrawCyclesCount() public view returns(uint _maxAllowedWithdrawCyclesCount);
	function validateWithdraw(address[] _hotelReservations) public view returns(bool success);
}
