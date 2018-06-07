pragma solidity 0.4.23;

import "./../Upgradeability/Forwardable.sol";
import "./RentalReservationFactory/IRentalReservationFactory.sol";


contract RentalReservationProxy is Forwardable {

	address public rentalReservationFactoryAddress;

	constructor(address _rentalReservationFactoryAddress) public {
		rentalReservationFactoryAddress = _rentalReservationFactoryAddress;
	}

	function () payable public {
		address rentalReservationImplAddress = IRentalReservationFactory(rentalReservationFactoryAddress).getImplAddress();
        delegatedFwd(rentalReservationImplAddress);
    }


}