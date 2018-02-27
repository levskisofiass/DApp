pragma solidity ^0.4.17;

import "./../../Upgradeability/UpgradeableProxy.sol";

contract HotelReservationFactoryProxy is UpgradeableProxy {
	function HotelReservationFactoryProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}