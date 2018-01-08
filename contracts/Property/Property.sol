pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IProperty.sol";
import "./PropertyFactory/IPropertyFactory.sol";

contract Property is IProperty, OwnableUpgradeableImplementation {
    bytes32 propertyId;
    bytes32 marketplaceId;
    address hostAddress;
    uint workingDayPrice;
    uint nonWorkingDayPrice;
    uint cleaningFee;
    uint refundPercent;
    uint daysBeforeStartForRefund;
    uint propertyArrayIndex;
    bool isInstantBooking;

    event LogCreateProperty(bytes32 _propertyId, address _hostAddress);
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 _propertyId, address _newHostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current property
     */
    modifier onlyHost() {
        require(msg.sender == hostAddress);
        _;
    }

    modifier onlyValidProperty(bytes32 _propertyId) {
        require(_propertyId != "");
        _;
    }

    modifier onlyNewProperty() {
        require(propertyId == "");
        _;
    }

    function getProperty() public constant
        returns(
            bytes32 _propertyId,
            address _hostAddress, 
            bytes32 _marketplaceId, 
            uint _workingDayPrice, 
            uint _nonWorkingDayPrice,
            uint _cleaningFee, 
            uint _refundPercent, 
            uint _daysBeforeStartForRefund, 
            uint _propertyArrayIndex,
            bool _isInstantBooking)
    {
        return (
            propertyId,
            hostAddress,
            marketplaceId,
            workingDayPrice,
            nonWorkingDayPrice,
            cleaningFee,
            refundPercent,
            daysBeforeStartForRefund,
            propertyArrayIndex,
            isInstantBooking
        );
    }

    function createProperty(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        uint _propertyArrayIndex,
        bool _isInstantBooking
		) public onlyNewProperty onlyValidProperty(_propertyId) returns(bool success)
	{
        propertyId = _propertyId;
        hostAddress = _hostAddress;
        marketplaceId = _marketplaceId;
        workingDayPrice = _workingDayPrice;
        nonWorkingDayPrice = _nonWorkingDayPrice;
        cleaningFee = _cleaningFee;
        refundPercent = _refundPercent;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        propertyArrayIndex = _propertyArrayIndex;
        isInstantBooking = _isInstantBooking;

        LogCreateProperty(_propertyId, _hostAddress);
        
		return true;
	}

    function validateUpdate(
        bytes32 _propertyId,
        address _newHostAddress
    ) public view onlyHost
        returns(bool success) 
    {
        require(_newHostAddress != address(0));
        require(propertyId == _propertyId);
        return true;
    }

    function updateProperty(
        bytes32 _propertyId,
		bytes32 _marketplaceId,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking,
        address _newHostAddress
    ) public returns(bool success)
    {
        validateUpdate(_propertyId, _newHostAddress);
     
        marketplaceId = _marketplaceId;
        hostAddress = _newHostAddress;
        workingDayPrice = _workingDayPrice;
        nonWorkingDayPrice = _nonWorkingDayPrice;
        cleaningFee = _cleaningFee;
        refundPercent = _refundPercent;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        isInstantBooking = _isInstantBooking;

        LogUpdateProperty(_marketplaceId, _propertyId, _newHostAddress);

        return true;
    }
}