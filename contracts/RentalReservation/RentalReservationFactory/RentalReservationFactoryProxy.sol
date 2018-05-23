pragma solidity ^0.4.23;

import "./../../Upgradeability/UpgradeableProxy.sol";

contract RentalReservationFactoryProxy is UpgradeableProxy {
	function RentalReservationFactoryProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}