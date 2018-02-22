pragma solidity ^0.4.17;

import "./../../../Upgradeability/UpgradeableProxy.sol";

contract HotelFactoryProxy is UpgradeableProxy {
	function HotelFactoryProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}