pragma solidity ^0.4.17;

import "./../../Upgradeability/UpgradeableProxy.sol";

contract PropertyFactoryProxy is UpgradeableProxy {
	function PropertyFactoryProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}