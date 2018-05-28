pragma solidity 0.4.23;

contract IRentalReservation {

event LogReservationCreated(bytes32 rentalReservationId, address _customerAddress, uint _reservationCostLOC);

function createRentalReservation(
		bytes32 _rentalReservationId,
		address _customerAddress,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		bytes32 _rentalId,
		uint _reservationCostLOC
	) public returns(bool success);

	function getRentalReservation() public view returns (
		bytes32 _rentalReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		bool _isDisputeOpen,
		bytes32 _rentalId);
}