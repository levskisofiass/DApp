pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../../Lifecycle/IPausable.sol";

contract IPropertyFactory is IOwnableUpgradeableImplementation, IPausable {
    event LogCreateProperty(bytes32 propertyId, address hostAddress);

    function init(address propertyImplAddress) public;

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
		) public returns(bool success);

    function propertiesCount() public constant returns(uint);
    
    function getPropertyId(uint index) public constant returns(bytes32);

    function setPropertyImpl(address propertyImplAddress) public;

    function getPropertyImpl() public constant returns(address propertyImpl);

    function getProperty(bytes32 propertyId) public constant
        returns(address hostAddress, bytes32 marketplaceId, uint workingDayPrice, uint nonWorkingDayPrice, uint cleaningFee, uint refundPercent, uint daysBeforeStartForRefund, uint propertyArrayIndex, bool isInstantBooking, bool isActive);
}
