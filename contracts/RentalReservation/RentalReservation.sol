pragma solidity 0.4.23;

import "./../Upgradeability/SharedStorage.sol";
import "./IRentalReservation.sol";
import "./../Tokens/StandardToken.sol";
import "./../Property/Rental/IRental.sol";
import "./../Property/Rental/RentalFactory/IRentalFactory.sol";

contract RentalReservation is SharedStorage, IRentalReservation {

	bytes32 rentalReservationId;
	address customerAddress;
	uint reservationCostLOC;
	uint checkInDate;
	uint checkOutDate;
	uint numberOfTravelers;
	bool isDisputeOpen;
	bytes32 rentalId;

	StandardToken public LOCTokenContract;
	IRentalReservation public rentalReservationContract;
	IRentalFactory public rentalFactoryContract;

	modifier onlyValidPeriodOfTime(uint _startDate, uint _endDate) {
		require(_startDate >= now);
		require(_startDate < _endDate);
		_;
	}

	modifier onlyNewReservations() {
		require(rentalReservationId == "");
		_;
	}

	function createRentalReservation(
		bytes32 _rentalReservationId,
		address _customerAddress,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		bytes32 _rentalId,
		uint _reservationCostLOC
	) public onlyNewReservations onlyValidPeriodOfTime( _checkInDate, _checkOutDate) returns(bool success) {
		
		rentalReservationId = _rentalReservationId;
		checkInDate = _checkInDate;
		checkOutDate = _checkOutDate;
		numberOfTravelers = _numberOfTravelers;
		isDisputeOpen = false;
		rentalId = _rentalId;
		reservationCostLOC = _reservationCostLOC;
		customerAddress = _customerAddress;


		emit LogReservationCreated(_rentalReservationId, msg.sender, reservationCostLOC);

		return true;
	}

	function getRentalReservation() public view returns (
		bytes32 _rentalReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		bool _isDisputeOpen,
		bytes32 _rentalId) {

			return(
			 rentalReservationId,
			 customerAddress,
			 reservationCostLOC,
			 checkInDate,
			 checkOutDate,
			 numberOfTravelers,
			 isDisputeOpen,
			 rentalId);
		}

}