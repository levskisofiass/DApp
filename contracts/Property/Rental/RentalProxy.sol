pragma solidity ^0.4.17;

import "./../../Upgradeability/Forwardable.sol";
import "./RentalFactory/IRentalFactory.sol";

contract RentalProxy is Forwardable {
	address public rentalFactoryAddress;
	IRentalFactory rentalFactoryContract;

	function RentalProxy(address _rentalFactoryAddress) public {
		rentalFactoryAddress = _rentalFactoryAddress;
		rentalFactoryContract = IRentalFactory(rentalFactoryAddress);
	}

	/**
    * @dev All calls made to the proxy are forwarded to the contract implementation via a delegatecall
    * @return Any bytes32 value the implementation returns
    */
    function () payable public {
		address rentalImplAddress = rentalFactoryContract.getImplAddress();
        delegatedFwd(rentalImplAddress, msg.data);
    }
}