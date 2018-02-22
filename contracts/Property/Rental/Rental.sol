pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IRental.sol";
import "./RentalFactory/IRentalFactory.sol";

contract Rental is IRental, OwnableUpgradeableImplementation {
    bytes32 rentalId;
    bytes32 marketplaceId;
    address hostAddress;
    uint workingDayPrice;
    uint nonWorkingDayPrice;
    uint cleaningFee;
    uint refundPercent;
    uint daysBeforeStartForRefund;
    uint rentalArrayIndex;
    bool isInstantBooking;
    address rentalFactoryContractAddress;
    mapping (uint256 => uint256) public timestampPrices;

    event LogCreateRental(bytes32 _rentalId, address _hostAddress);
    event LogUpdateRental(bytes32 _marketplaceId, bytes32 _rentalId, address _newHostAddress);
    event LogSetPriceRental(bytes32 rentalId, uint256 timestamp, uint256 price);

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current rental
     */
    modifier onlyHost() {
        require(msg.sender == hostAddress);
        _;
    }

    modifier onlyValidRental(bytes32 _rentalId) {
        require(_rentalId != "");
        _;
    }

    modifier onlyNewRental() {
        require(rentalId == "");
        _;
    }

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
            bool _isInstantBooking)
    {
        return (
            rentalId,
            hostAddress,
            marketplaceId,
            workingDayPrice,
            nonWorkingDayPrice,
            cleaningFee,
            refundPercent,
            daysBeforeStartForRefund,
            rentalArrayIndex,
            isInstantBooking
        );
    }

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
		) public onlyNewRental onlyValidRental(_rentalId) returns(bool success)
	{
        rentalId = _rentalId;
        hostAddress = _hostAddress;
        marketplaceId = _marketplaceId;
        workingDayPrice = _workingDayPrice;
        nonWorkingDayPrice = _nonWorkingDayPrice;
        cleaningFee = _cleaningFee;
        refundPercent = _refundPercent;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        rentalArrayIndex = _rentalArrayIndex;
        isInstantBooking = _isInstantBooking;
        rentalFactoryContractAddress = _rentalFactoryContractAddress;

        LogCreateRental(_rentalId, _hostAddress);
        
		return true;
	}

    function validateUpdate(
        bytes32 _rentalId,
        address _newHostAddress
    ) public view onlyHost
        returns(bool success) 
    {
        require(_newHostAddress != address(0));
        require(rentalId == _rentalId);
        return true;
    }

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
    ) public returns(bool success)
    {
        validateUpdate(_rentalId, _newHostAddress);
     
        marketplaceId = _marketplaceId;
        hostAddress = _newHostAddress;
        workingDayPrice = _workingDayPrice;
        nonWorkingDayPrice = _nonWorkingDayPrice;
        cleaningFee = _cleaningFee;
        refundPercent = _refundPercent;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        isInstantBooking = _isInstantBooking;

        LogUpdateRental(_marketplaceId, _rentalId, _newHostAddress);

        return true;
    }

    /**
     * @dev function use to set price for rental in different days
     * @param _timestampStart - the UNIX timestamp of start point
     * @param _timestampEnd - the UNIX timestamp of end point
     * @param _price - price of rental
     */
    function setPrice(
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _price
    ) public onlyHost returns(bool success) 
    {
        require(_timestampEnd >= _timestampStart);
        require(_timestampStart >= now);
        require(_price > 0);

        IRentalFactory rentalFactoryContract = IRentalFactory(rentalFactoryContractAddress);
        require((_timestampEnd - _timestampStart) <= rentalFactoryContract.getMaxBookingPeriod() * 1 days);

        for (uint day = _timestampStart; day <= _timestampEnd; (day += 1 days)) {
            timestampPrices[day] = _price;
            LogSetPriceRental(rentalId, day, _price);
        }

        return true;
    }

    /**
     * @dev function use to get price for rental in different day
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