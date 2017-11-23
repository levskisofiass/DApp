pragma solidity ^0.4.17;

import "./../Upgradeability/UpgradeableProxy.sol";

contract MarketplaceProxy is UpgradeableProxy {
	function MarketplaceProxy(address initialImplementation) public UpgradeableProxy(initialImplementation) {}
}