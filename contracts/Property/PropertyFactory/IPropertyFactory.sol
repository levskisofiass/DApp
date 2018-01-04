pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../../Lifecycle/IPausable.sol";

contract IPropertyFactory is IOwnableUpgradeableImplementation, IPausable {
    event LogCreatePropertyContract(bytes32 propertyId, address hostAddress, address propertyContract);
    event LogSetMaxBookingDaysInterval(uint256 interval, address hostAddress);

    function validateCreate(
        bytes32 propertyId,
        bytes32 marketplaceId
    ) public returns(bool success);

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
    function getPropertyContractAddress(bytes32 _propertyId) public constant returns(address propertyContract);

    function setPropertyImplAddress(address propertyImplAddress) public;
    function getPropertyImplAddress() public constant returns(address propertyImpl);

    function setMarketplaceAddress(address propertyImplAddress) public;
    function getMarketplaceAddress() public constant returns(address marketplaceAddress);

    function setMaxBookingDaysInterval(uint256 _maxDaysInterval) public returns(bool success);
    function getMaxBookingDaysInterval() public constant returns(uint256 _maxDaysInterval);
}
