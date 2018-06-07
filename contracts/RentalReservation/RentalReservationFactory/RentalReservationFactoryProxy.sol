pragma solidity ^0.4.23;

import "./../../Upgradeability/UpgradeableProxy.sol";

contract RentalReservationFactoryProxy is UpgradeableProxy {
	constructor (address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}