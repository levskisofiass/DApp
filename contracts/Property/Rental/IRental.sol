pragma solidity ^0.4.23;

import "./../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IRental is IOwnableUpgradeableImplementation {
    event LogCreateRental(bytes32 rentalId, address hostAddress);
    event LogUpdateRental(bytes32 _rentalId, address _newHostAddress);
    event LogSetPriceRental(bytes32 rentalId, uint256 timestamp, uint256 price);

    function createRental(
        bytes32 _rentalId,
        address _hostAddress,
		uint _defaultDailyRate,
        uint _weekendRate,
        uint _cleaningFee,
        uint[] _refundPercentages,
        uint[] _daysBeforeStartForRefund,
        uint _rentalArrayIndex,
        bool _isInstantBooking,
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle
		) public returns(bool success);

    function updateRental(
      bytes32 _rentalId,
		uint _defaultDailyRate,
        uint _weekendRate,
        uint _cleaningFee,
        uint[] _refundPercentages,
        uint[] _daysBeforeStartForRefund,
        bool _isInstantBooking,
        address _newHostAddress,
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle
        ) public returns(bool success);

    function validateUpdate(
        bytes32 _rentalId,
        address _newHostAddress
        ) public view returns(bool success);

    function getRental() public constant
        returns(
            bytes32 _rentalId,
            address _hostAddress,  
            uint _defaultDailyRate, 
            uint _weekendRate,
            uint _cleaningFee, 
            uint[] _refundPercent, 
            uint[] _daysBeforeStartForRefund, 
            uint _rentalArrayIndex,
            bool _isInstantBooking,
            uint _deposit,
            uint _minNightsStay,
            string _rentalTitle);

    function setPrice(uint256 _timestampStart, uint256 _timestampEnd, uint256 _price) public returns(bool success);

    function getPrice(uint256 _timestamp) public constant returns(uint price);
    function validateRefundPercentages( uint[] _refundPercentages) public view returns (bool success);
    function getReservationCost(uint _checkInDate ,uint _days) public view returns (uint _reservationCostLoc);
    function getWeekday(uint timestamp) public pure returns (uint);
    function getRentalId() public view returns(bytes32 _rentalId);
}
