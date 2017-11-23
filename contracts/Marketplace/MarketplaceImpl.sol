pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IMarketplaceImpl.sol";
import "./../Pausable.sol";

contract MarketplaceImpl is IMarketplaceImpl, OwnableUpgradeableImplementation, Pausable {

    struct Marketplace {
        address adminAddress;
        bytes url;
        bytes propertyAPI;
        bytes disputeAPI;
        address exchangeContractAddress;
        uint marketplaceArrayIndex;
        bool isApproved;
		bool isActive;
    }

    bytes32[] public marketplaceIds;
    mapping (bytes32 => Marketplace) public marketplaces;

	bool isApprovalPolicyActive;

	event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes url);

	uint public rate;

    /**
     * @dev modifier ensuring that the modified method is only called on active marketplaces
     * @param marketplaceId - the identifier of the marketplace
     */
    modifier onlyActive(bytes32 marketplaceId) {
        require(marketplaceId != 0);
        require(marketplaces[marketplaceId].isActive);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called on inactive marketplaces
     * @param marketplaceId - the identifier of the marketplace
     */
    modifier onlyInactive(bytes32 marketplaceId) {
        require(marketplaceId != 0);
        require(!marketplaces[marketplaceId].isActive);
        _;
    }

	function createMarketplace(
		bytes32 _marketplaceId, 
		bytes _url, 
		bytes _propertyAPI, 
		bytes _disputeAPI, 
		address _exchangeContractAddress
		) public onlyInactive(_marketplaceId) whenNotPaused returns(bool success)
	{
		marketplaces[_marketplaceId] = Marketplace({
        	adminAddress: msg.sender,
			url: _url,
        	propertyAPI: _propertyAPI,
        	disputeAPI: _disputeAPI,
         	exchangeContractAddress: _exchangeContractAddress,
        	marketplaceArrayIndex: marketplaceIds.length,
        	isApproved: !isApprovalPolicyActive,
			isActive: true
        });

        marketplaceIds.push(_marketplaceId);
        LogCreateMarketplace(_marketplaceId, msg.sender, _url);
		return true;
	}
}