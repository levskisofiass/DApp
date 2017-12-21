pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../Lifecycle/IPausable.sol";

contract IProperty is IOwnableUpgradeableImplementation, IPausable {
    event LogCreateProperty(bytes32 propertyId, address hostAddress);
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 propertyId, address hostAddress);

    function create(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
		) public returns(bool success);

    function update(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking,
        address _newHost
    ) public returns(bool success);

    function validateCreate(
        bytes32 propertyId,
        bytes32 marketplaceId
    ) public returns(bool success);

    function validateUpdate(
        bytes32 propertyId,
        bytes32 marketplaceId,
        address hostAddress
    ) public returns(bool success);

    function setMarketplace(address _marketplaceAddress) public;

    function propertiesCount() public constant returns(uint);
    
    function getPropertyId(uint index) public constant returns(bytes32);

    function getProperty(bytes32 propertyId) public constant
        returns(address hostAddress, bytes32 marketplaceId, uint workingDayPrice, uint nonWorkingDayPrice, uint cleaningFee, uint refundPercent, uint daysBeforeStartForRefund, uint propertyArrayIndex, bool isInstantBooking, bool isActive);
}
