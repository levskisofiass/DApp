pragma solidity ^0.4.17;

import "./../Upgradeability/Forwardable.sol";
import "./../Property/PropertyFactory/IPropertyFactory.sol";

contract PropertyProxy is Forwardable {
	address public propertyFactoryAddress;
	IPropertyFactory propertyFactoryContract;

	function PropertyProxy(address _propertyFactoryAddress) public {
		propertyFactoryAddress = _propertyFactoryAddress;
		propertyFactoryContract = IPropertyFactory(propertyFactoryAddress);
	}

	/**
    * @dev All calls made to the proxy are forwarded to the contract implementation via a delegatecall
    * @return Any bytes32 value the implementation returns
    */
    function () payable public {
		address propertyImplAddress = propertyFactoryContract.getPropertyImplAddress();
        delegatedFwd(propertyImplAddress, msg.data);
    }
}