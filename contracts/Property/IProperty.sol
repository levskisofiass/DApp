pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IProperty is IOwnableUpgradeableImplementation {
    event LogCreateProperty(bytes32 propertyId, address hostAddress);    
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 _propertyId, address _newHostAddress);
    event LogSetPriceProperty(bytes32 propertyId, uint256 timestamp, uint256 price);

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
		) public returns(bool success);

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
        ) public returns(bool success);

    function validateUpdate(
        bytes32 _propertyId,
        address _newHostAddress
        ) public view returns(bool success);

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
            bool _isInstantBooking);

    function setPrice(uint256 _timestampStart, uint256 _timestampEnd, uint256 _price) public returns(bool success);

    function getPrice(uint256 _timestamp) public constant returns(uint price);
}
