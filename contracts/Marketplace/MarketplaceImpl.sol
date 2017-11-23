pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IMarketplaceImpl.sol";
import "./../Pausable.sol";

contract MarketplaceImpl is IMarketplaceImpl, OwnableUpgradeableImplementation, Pausable {

    struct Marketplace {
        address adminAddress;
        bytes32 url;
        bytes32 propertyAPI;
        bytes32 disputeAPI;
        address exchangeContractAddress;
        uint marketplaceArrayIndex;
        bool isApproved;
		bool isActive;
    }

    bytes32[] public marketplaceIds;
    mapping (bytes32 => Marketplace) public marketplaces;

	bool approveOnCreation;

	event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes32 url);

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

    function marketplacesCount() public constant returns(uint) {
        return marketplaceIds.length;
    }

    function getMarketplace(bytes32 marketplaceId) public constant
        returns(address, bytes32, bytes32, bytes32, address, uint, bool, bool)
    {
        Marketplace storage m = marketplaces[marketplaceId];
        return (
            m.adminAddress,
            m.url,
            m.propertyAPI,
            m.disputeAPI,
            m.exchangeContractAddress,
            m.marketplaceArrayIndex,
            m.isApproved,
            m.isActive
        );
    }

    function getMarketplaceId(uint index) public constant returns(bytes32) {
        return marketplaceIds[index];
    }

	function createMarketplace(
		bytes32 _marketplaceId, 
		bytes32 _url,
		bytes32 _propertyAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress
		) public onlyInactive(_marketplaceId) whenNotPaused returns(bool success)
	{
        require(_exchangeContractAddress != address(0));
        require(_url != "");
        require(_propertyAPI != "");
        require(_disputeAPI != "");

		marketplaces[_marketplaceId] = Marketplace({
        	adminAddress: msg.sender,
			url: _url,
        	propertyAPI: _propertyAPI,
        	disputeAPI: _disputeAPI,
         	exchangeContractAddress: _exchangeContractAddress,
        	marketplaceArrayIndex: marketplaceIds.length,
        	isApproved: approveOnCreation,
			isActive: true
        });

        marketplaceIds.push(_marketplaceId);
        LogCreateMarketplace(_marketplaceId, msg.sender, _url);
		return true;
	}
}