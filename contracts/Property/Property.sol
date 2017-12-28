pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IProperty.sol";
import "./../Lifecycle/Pausable.sol";
import "./../Property/PropertyFactory/IPropertyFactory.sol";

contract Property is IProperty, OwnableUpgradeableImplementation {
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
    // function validateUpdate(
    //     bytes32 _propertyId,
    //     bytes32 _marketplaceId,
    //     address _hostAddress
    // ) public 
    //     onlyPropertyFactory()
    //     whenNotPaused
    //     returns(bool success) 
    // {
    //     require(propertyId == _propertyId);
    //     require(hostAddress == _hostAddress);
    //     return true;
    // }

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

    // function update(
    //     bytes32 _propertyId,
	// 	bytes32 _marketplaceId,
    //     address _hostAddress,
	// 	uint _workingDayPrice,
    //     uint _nonWorkingDayPrice,
    //     uint _cleaningFee,
    //     uint _refundPercent,
    //     uint _daysBeforeStartForRefund,
    //     bool _isInstantBooking,
    //     address _newHost
    // ) public returns(bool success)
    // {
    //     require(_hostAddress != address(0));
    //     require(_newHost != address(0));

    //     validateUpdate(_propertyId, _marketplaceId, _hostAddress);
        
    //     PropertyStruct storage property = properties[_propertyId];

    //     property.hostAddress = _newHost;
    //     property.workingDayPrice = _workingDayPrice;
    //     property.nonWorkingDayPrice = _nonWorkingDayPrice;
    //     property.cleaningFee = _cleaningFee;
    //     property.refundPercent = _refundPercent;
    //     property.daysBeforeStartForRefund = _daysBeforeStartForRefund;
    //     property.isInstantBooking = _isInstantBooking;

    //     LogUpdateProperty(_marketplaceId, _propertyId, _hostAddress);

    //     return true;
    // }
}