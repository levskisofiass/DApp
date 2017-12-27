pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Lifecycle/Pausable.sol";
import "./../../Marketplace/IMarketplace.sol";
import "./../PropertyProxy.sol";
import "./../IProperty.sol";
import "./IPropertyFactory.sol";

contract PropertyFactory is IPropertyFactory, OwnableUpgradeableImplementation, Pausable {
    IMarketplace private MarketplaceContract; 
    address private propertyImplContract;
    bytes32[] private propertyIds;
    mapping (bytes32 => address) private properties;

    event LogCreateProperty(bytes32 propertyId, address hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called for not existing properties
     * @param propertyId - the identifier of the property
     */
    modifier onlyNotExisting(bytes32 propertyId) {
        require(properties[propertyId] == address(0));
        _;
    }

    function init(address propertyImplAddress) public {
        super.init();
        propertyImplContract = propertyImplAddress;
    }

    function propertiesCount() public constant returns(uint) {
        return propertyIds.length;
    }

    function getPropertyId(uint index) public constant returns(bytes32) {
        return propertyIds[index];
    }

    function getProperty(bytes32 propertyId) public constant
        returns(address hostAddress, bytes32 marketplaceId, uint workingDayPrice, uint nonWorkingDayPrice, uint cleaningFee, uint refundPercent, uint daysBeforeStartForRefund, uint propertyArrayIndex, bool isInstantBooking, bool isActive)
    {
        // PropertyStruct storage p = properties[propertyId];
        // return (
        //     p.hostAddress,
        //     p.marketplaceId,
        //     p.workingDayPrice,
        //     p.nonWorkingDayPrice,
        //     p.cleaningFee,
        //     p.refundPercent,
        //     p.daysBeforeStartForRefund,
        //     p.propertyArrayIndex,
        //     p.isInstantBooking,
        //     p.isActive
        // );
    }

    function setPropertyImpl(address propertyImplAddress) onlyOwner public {
        propertyImplContract = propertyImplAddress;
    }

    function getPropertyImpl() public constant returns(address propertyImpl) {
        return propertyImplContract;
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
		) public onlyNotExisting(_propertyId) whenNotPaused returns(bool success)
	{
        require(_marketplaceId != "");
        require(_hostAddress != address(0));

        MarketplaceContract = IMarketplace(msg.sender);
        require(MarketplaceContract.isMarketplace());
        require(MarketplaceContract.isApprovedMarketplace(_marketplaceId));

        PropertyProxy proxy = new PropertyProxy(propertyImplContract);
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
            _isInstantBooking
        );
		properties[_propertyId] = propertyContract;
        propertyIds.push(_propertyId);

        LogCreateProperty(_propertyId, _hostAddress);
		return true;
	}
}