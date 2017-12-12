pragma solidity ^0.4.17;

import "./../Upgradeability/UpgradeableProxy.sol";

contract PropertyProxy is UpgradeableProxy {
	function PropertyProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}