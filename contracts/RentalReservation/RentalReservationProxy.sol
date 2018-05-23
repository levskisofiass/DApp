pragma solidity 0.4.23;

import "./../Upgradeability/Forwardable.sol";
import "./RentalReservationFactory/IRentalReservationFactory.sol";


contract RentalReservationProxy is Forwardable {

	address public rentalReservationFactoryAddress;
	IRentalReservationFactory rentalReservationFactoryContract;

	constructor(address _rentalReservationFactoryAddress) public {
		rentalReservationFactoryAddress = _rentalReservationFactoryAddress;
		rentalReservationFactoryContract = IRentalReservationFactory(rentalReservationFactoryAddress);
	}

	function () payable public {
		address rentalReservationImplAddress = rentalReservationFactoryContract.getImplAddress();
        delegatedFwd(rentalReservationImplAddress, msg.data);
    }


}