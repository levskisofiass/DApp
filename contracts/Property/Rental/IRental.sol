pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IRental is IOwnableUpgradeableImplementation {
    event LogCreateRental(bytes32 rentalId, address hostAddress);
    event LogUpdateRental(bytes32 _marketplaceId, bytes32 _rentalId, address _newHostAddress);
    event LogSetPriceRental(bytes32 rentalId, uint256 timestamp, uint256 price);

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
        bool _isInstantBooking,
        address _rentalFactoryContractAddress
		) public returns(bool success);

    function updateRental(
        bytes32 _rentalId,
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
        bytes32 _rentalId,
        address _newHostAddress
        ) public view returns(bool success);

    function getRental() public constant
        returns(
            bytes32 rentalId,
            address hostAddress, 
            bytes32 marketplaceId, 
            uint workingDayPrice, 
            uint nonWorkingDayPrice,
            uint cleaningFee, 
            uint refundPercent, 
            uint daysBeforeStartForRefund, 
            uint rentalArrayIndex,
            bool isInstantBooking);

    function setPrice(uint256 _timestampStart, uint256 _timestampEnd, uint256 _price) public returns(bool success);

    function getPrice(uint256 _timestamp) public constant returns(uint price);
}
