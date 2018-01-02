pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Lifecycle/Pausable.sol";
import "./../../Marketplace/IMarketplace.sol";
import "./../PropertyProxy.sol";
import "./../IProperty.sol";
import "./IPropertyFactory.sol";

contract PropertyFactory is IPropertyFactory, OwnableUpgradeableImplementation, Pausable {
    address public marketplaceContractAddress; 
    IMarketplace public MarketplaceContract; 
    address public propertyImplContract;
    bytes32[] public propertyIds;
    mapping (bytes32 => address) public properties;

    event LogCreatePropertyContract(bytes32 propertyId, address hostAddress, address propertyContract);

    /**
     * @dev modifier ensuring that the modified method is only called for not existing properties
     * @param propertyId - the identifier of the property
     */
    modifier onlyNotExisting(bytes32 propertyId) {
        require(properties[propertyId] == address(0));
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called by marketplace contract
     */
    modifier onlyMarketplace(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(marketplaceContractAddress == msg.sender);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called by approved marketplace
     */
    modifier onlyApprovedMarketplace(bytes32 marketplaceId) {
        MarketplaceContract = IMarketplace(msg.sender);
        require(MarketplaceContract.isApprovedMarketplace(marketplaceId));
        _;
    }

    function propertiesCount() public constant returns(uint) {
        return propertyIds.length;
    }

    function getPropertyId(uint index) public constant returns(bytes32) {
        return propertyIds[index];
    }

    function getPropertyContractAddress(bytes32 _propertyId) public constant returns(address propertyContract) {
        return properties[_propertyId];
    }

    // function getProperty(bytes32 propertyId) public constant
    //     returns(address hostAddress, bytes32 marketplaceId, uint workingDayPrice, uint nonWorkingDayPrice, uint cleaningFee, uint refundPercent, uint daysBeforeStartForRefund, uint propertyArrayIndex, bool isInstantBooking, bool isActive)
    // {
    //     PropertyStruct storage p = properties[propertyId];
    //     return (
    //         p.hostAddress,
    //         p.marketplaceId,
    //         p.workingDayPrice,
    //         p.nonWorkingDayPrice,
    //         p.cleaningFee,
    //         p.refundPercent,
    //         p.daysBeforeStartForRefund,
    //         p.propertyArrayIndex,
    //         p.isInstantBooking,
    //         p.isActive
    //     );
    // }

    function setPropertyImplAddress(address propertyImplAddress) onlyOwner public {
        propertyImplContract = propertyImplAddress;
    }

    function getPropertyImplAddress() public constant returns(address propertyImpl) {
        return propertyImplContract;
    }

    function setMarketplaceAddress(address marketplaceAddress) onlyOwner public {
        marketplaceContractAddress = marketplaceAddress;
    }

    function getMarketplaceAddress() public constant returns(address marketplaceAddress) {
        return marketplaceContractAddress;
    }

    function validateCreate(
        bytes32 propertyId,
        bytes32 marketplaceId
    ) public 
        onlyNotExisting(propertyId)
        onlyMarketplace(marketplaceId)
        onlyApprovedMarketplace(marketplaceId)
        whenNotPaused
        returns(bool success) 
    {
        return true;
    }

    function createNewProperty(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
		) public returns(bool success)
	{
        require(_hostAddress != address(0));
        validateCreate(_propertyId, _marketplaceId);

        PropertyProxy proxy = new PropertyProxy(this);
        IProperty propertyContract = IProperty(proxy);

        propertyContract.createProperty(
            _propertyId,
            _marketplaceId, 
            _hostAddress,
            _workingDayPrice,
            _nonWorkingDayPrice,
            _cleaningFee,
            _refundPercent,
            _daysBeforeStartForRefund,
            propertyIds.length,
            _isInstantBooking
        );
		properties[_propertyId] = propertyContract;
        propertyIds.push(_propertyId);

        LogCreatePropertyContract(_propertyId, _hostAddress, propertyContract);
		return true;
	}
}