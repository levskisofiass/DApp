pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IProperty.sol";
import "./../Lifecycle/Pausable.sol";
import "./../Marketplace/Marketplace.sol";

contract Property is IProperty, OwnableUpgradeableImplementation, Pausable {
    struct PropertyStruct {
        address hostAddress;
        bytes32 marketplaceId;
        uint workingDayPrice;
        uint nonWorkingDayPrice;
        uint cleaningFee;
        uint refundPercent;
        uint daysBeforeStartForRefund;
        uint propertyArrayIndex;
        bool isInstantBooking;
		bool isActive;
    }

    bytes32[] public propertyIds;
    mapping (bytes32 => PropertyStruct) public properties;

    event LogCreateProperty(bytes32 propertyId, address hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called on active properties
     * @param propertyId - the identifier of the property
     */
    modifier onlyActive(bytes32 propertyId) {
        require(propertyId != "");
        require(properties[propertyId].isActive);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called on inactive properties
     * @param propertyId - the identifier of the property
     */
    modifier onlyInactive(bytes32 propertyId) {
        require(propertyId != "");
        require(!properties[propertyId].isActive);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current property
     * @param propertyId - the identifier of the property
     */
    modifier onlyHost(bytes32 propertyId) {
        require(propertyId != "");
        require(properties[propertyId].hostAddress == msg.sender);
        _;
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
        PropertyStruct storage p = properties[propertyId];
        return (
            p.hostAddress,
            p.marketplaceId,
            p.workingDayPrice,
            p.nonWorkingDayPrice,
            p.cleaningFee,
            p.refundPercent,
            p.daysBeforeStartForRefund,
            p.propertyArrayIndex,
            p.isInstantBooking,
            p.isActive
        );
    }

    function create(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
		) public onlyInactive(_propertyId) whenNotPaused returns(bool success)
	{
        require(Marketplace(msg.sender).isMarketPlace());
        require(_marketplaceId != "");

		properties[_propertyId] = PropertyStruct({
            hostAddress: msg.sender,
            marketplaceId: _marketplaceId,
            workingDayPrice: _workingDayPrice,
            nonWorkingDayPrice: _nonWorkingDayPrice,
            cleaningFee: _cleaningFee,
            refundPercent: _refundPercent,
            daysBeforeStartForRefund: _daysBeforeStartForRefund,
            propertyArrayIndex: propertyIds.length,
            isInstantBooking: _isInstantBooking,
            isActive: true
        });

        propertyIds.push(_propertyId);
        LogCreateProperty(_propertyId, msg.sender);
        
		return true;
	}
}