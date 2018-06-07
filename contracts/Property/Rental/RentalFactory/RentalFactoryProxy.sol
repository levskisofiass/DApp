pragma solidity ^0.4.23;

import "./../../../Upgradeability/UpgradeableProxy.sol";

contract RentalFactoryProxy is UpgradeableProxy {
	constructor(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}