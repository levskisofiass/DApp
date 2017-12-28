pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../Lifecycle/IPausable.sol";

contract IProperty is IOwnableUpgradeableImplementation {
    event LogCreateProperty(bytes32 propertyId, address hostAddress);
    event LogUpdateProperty(bytes32 _marketplaceId, bytes32 propertyId, address hostAddress);

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
		) public returns(bool success);

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
    // ) public returns(bool success);

    // function validateUpdate(
    //     bytes32 propertyId,
    //     bytes32 marketplaceId,
    //     address hostAddress
    // ) public returns(bool success);

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
}
