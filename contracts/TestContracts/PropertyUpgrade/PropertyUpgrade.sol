pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IPropertyUpgrade.sol";
import "./../../Property/PropertyFactory/IPropertyFactory.sol";

/**
* @dev This contract is only used to test the upgreadability - DO NOT DEPLOY TO PRODUCTION
*/
contract PropertyUpgrade is IPropertyUpgrade, OwnableUpgradeableImplementation {
    bytes32 propertyId;
    address hostAddress;
    bytes32 marketplaceId;
    uint workingDayPrice;
    uint nonWorkingDayPrice;
    uint cleaningFee;
    uint refundPercent;
    uint daysBeforeStartForRefund;
    uint propertyArrayIndex;
    bool isInstantBooking;

    event LogCreateProperty(bytes32 _propertyId, address _hostAddress);
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 _propertyId, address _hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current property
     * @param _propertyId - the identifier of the property
     * @param _hostAddress - the address of the host
     */
    modifier onlyHost(bytes32 _propertyId, address _hostAddress) {
        require(_propertyId != "");
        require(hostAddress == _hostAddress);
        _;
    }

    modifier onlyNewProperty(bytes32 _propertyId) {
        require(_propertyId != "");
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
		) public onlyNewProperty(_propertyId) returns(bool success)
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

    function updateCleaningFee(
        uint _cleaningFee
		) public returns(bool success)
	{
        cleaningFee = _cleaningFee;
        
		return true;
	}

}