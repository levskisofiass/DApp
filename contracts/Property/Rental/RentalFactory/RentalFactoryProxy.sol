pragma solidity ^0.4.17;

import "./../../../Upgradeability/UpgradeableProxy.sol";

contract RentalFactoryProxy is UpgradeableProxy {
	function RentalFactoryProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}