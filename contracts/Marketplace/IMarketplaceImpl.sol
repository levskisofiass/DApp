pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IMarketplaceImpl is OwnableUpgradeableImplementation, Pausable {

	function createMarketplace(
		bytes32 _marketplaceId,
		bytes _url,
		bytes _propertyAPI,
		bytes _disputeAPI,
		address _exchangeContractAddress
	) public onlyInactive(_marketplaceId) whenNotPaused returns(bool success);
}