pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IProperty.sol";
import "./PropertyFactory/IPropertyFactory.sol";

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
    address propertyFactoryContractAddress;

    event LogCreateProperty(bytes32 _propertyId, address _hostAddress);
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 _propertyId, address _hostAddress);
    event LogSetPriceProperty(uint256 timestamp, uint256 price);

    /**
     * @dev Mapping to save different prices for different days
     */
    mapping (uint256 => uint256) public timestampPrices;

    // /**
    //  * @dev modifier ensuring that the modified method is only called by the host of current property
    //  * @param _propertyId - the identifier of the property
    //  * @param _hostAddress - the address of the host
    //  */
    // modifier onlyHost(bytes32 _propertyId, address _hostAddress) {
    //     require(_propertyId != "");
    //     require(hostAddress == _hostAddress);
    //     _;
    // }

    modifier onlyValidProperty(bytes32 _propertyId) {
        require(_propertyId != "");
        _;
    }

    modifier onlyNewProperty(bytes32 _propertyId) {
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
        bool _isInstantBooking,
        address _propertyFactoryContractAddress
		) public onlyNewProperty(_propertyId) onlyValidProperty(_propertyId) returns(bool success)
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
        propertyFactoryContractAddress = _propertyFactoryContractAddress;

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

    /**
     * @dev function use to set price for property in different days
     * @param _timestampStart - the UNIX timestamp of start point
     * @param _timestampEnd - the UNIX timestamp of end point
     * @param _price - price of property 
     */
    function setPrice(
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _price
    ) public returns(bool success) 
    {
        //TODO: add onlyHost
        require(_timestampEnd >= _timestampStart);
        require(_timestampStart >= now);
        require(_timestampEnd >= now);
        require(_price > 0);

        IPropertyFactory propertyFactoryContract = IPropertyFactory(propertyFactoryContractAddress);
        uint256 intervalPricing = (_timestampEnd - _timestampStart);
        require(intervalPricing <= propertyFactoryContract.getMaxBookingDaysInterval());

        for (uint day = _timestampStart; day <= _timestampEnd; (day += 1 days)) {
            timestampPrices[day] = _price;
            LogSetPriceProperty(day, _price);
        }

        return true;
    }

    /**
     * @dev function use to get price for property in different day
     * @param _timestamp - the UNIX timestamp
     */
    function getPrice(uint256 _timestamp) public constant returns(uint256 price) {
        require(_timestamp > 0);

        if (timestampPrices[_timestamp] > 0) 
            return timestampPrices[_timestamp];
        else
            return workingDayPrice;
    }
}
