pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../IPausable.sol";

contract IMarketplace is IOwnableUpgradeableImplementation, IPausable {

    event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes32 url);

    function createMarketplace(
		bytes32 _marketplaceId,
		bytes32 _url,
		bytes32 _propertyAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress
	) public returns(bool success);

    function marketplacesCount() public constant returns(uint);

    function getMarketplace(bytes32 marketplaceId) public constant
        returns(address, bytes32, bytes32, bytes32, address, uint, bool, bool);

    function getMarketplaceId(uint index) public constant returns(bytes32);
}