pragma solidity ^0.4.23;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IRentalReservationFactory is IOwnableUpgradeableImplementation {

	function setImplAddress(address implAddress) public;
    function getImplAddress() public view returns(address implAddress);
	function getRentalReservationsCount() public view returns(uint _rentalReservationCount);
	function setLOCTokenContractAddress(address locTokenContractAddress) public;

	function createRentalReservation(
		bytes32 _rentalReservationId,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		address _rentalAddress
	) public returns(bool success);
}