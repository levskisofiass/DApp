pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IRentalUpgrade is IOwnableUpgradeableImplementation {
    event LogCreateRental(bytes32 rentalId, address hostAddress);
    event LogUpdateRental(bytes32 _marketplaceId, bytes32 rentalId, address hostAddress);

    function createRental(
        bytes32 _rentalId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        uint _rentalArrayIndex,
        bool _isInstantBooking
		) public returns(bool success);

    function getRental() public constant
        returns(
            bytes32 _rentalId,
            address _hostAddress, 
            bytes32 _marketplaceId, 
            uint _workingDayPrice, 
            uint _nonWorkingDayPrice,
            uint _cleaningFee, 
            uint _refundPercent, 
            uint _daysBeforeStartForRefund, 
            uint _rentalArrayIndex,
            bool _isInstantBooking);

    function updateCleaningFee(uint _cleaningFee) public returns(bool success);
}
