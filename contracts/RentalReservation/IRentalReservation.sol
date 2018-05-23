pragma solidity 0.4.23;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IRentalReservation {

event LogReservationCreated(bytes32 rentalReservationId, address _customerAddress, uint _reservationCostLOC);

function createRentalReservation(
		bytes32 _rentalReservationId,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		bytes32 _rentalId,
		uint _reservationCostLOC
	) public returns(bool success);
}