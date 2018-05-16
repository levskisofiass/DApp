pragma solidity ^0.4.23;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IRental.sol";
import "./RentalFactory/IRentalFactory.sol";

contract Rental is IRental, OwnableUpgradeableImplementation {
    bytes32 rentalId;
    address hostAddress;
    uint defaultDailyRate;
    uint weekendRate;
    uint cleaningFee;
    uint[] refundPercentages;
    uint[] daysBeforeStartForRefund;
    uint rentalArrayIndex;
    bool isInstantBooking;
    address rentalFactoryContractAddress;
    uint deposit;
    uint minNightsStay;
    string rentalTitle;
    mapping (uint256 => uint256) public customRate;

    event LogCreateRental(bytes32 _rentalId, address _hostAddress);
    event LogUpdateRental( bytes32 _rentalId, address _newHostAddress);
    event LogSetPriceRental(bytes32 rentalId, uint256 timestamp, uint256 price);

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current rental
     */
    modifier onlyHost() {
        require(msg.sender == hostAddress);
        _;
    }

    function onlyValidRental(bytes32 _rentalId) public view returns(bool success) {
        require(_rentalId != "");
        return true;
    }

    modifier onlyNewRental() {
        require(rentalId == "");
        _;
    }
    modifier onlyValidArraysForCancelation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages) {
		require(_daysBeforeStartForRefund.length == _refundPercentages.length);
		require(_daysBeforeStartForRefund.length > 0 && _daysBeforeStartForRefund.length <= 7);
		require(_refundPercentages.length > 0 && _refundPercentages.length <= 7);
		_; 
	}

    function validateRefundPercentages( uint[] _refundPercentages) public view returns (bool success) {
		
		for (uint i = 0 ; i < _refundPercentages.length; i++) {
			require(_refundPercentages[i] <= 100 && _refundPercentages[i] >= 0 );
		}
		return true;
	}

    function getRental() public constant
        returns(
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
            string _rentalTitle)
    {
        return (
            rentalId,
            hostAddress,
            defaultDailyRate,
            weekendRate,
            cleaningFee,
            refundPercentages,
            daysBeforeStartForRefund,
            rentalArrayIndex,
            isInstantBooking,
            deposit,
            minNightsStay,
            rentalTitle
        );
    }

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
		) public onlyNewRental onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund)  returns(bool success)
	{
        require(onlyValidRental(_rentalId));
        validateRefundPercentages(_refundPercentages);

        rentalId = _rentalId;
        hostAddress = _hostAddress;
        defaultDailyRate = _defaultDailyRate;
        weekendRate = _weekendRate;
        cleaningFee = _cleaningFee;
        refundPercentages = _refundPercentages;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        rentalArrayIndex = _rentalArrayIndex;
        isInstantBooking = _isInstantBooking;
        rentalFactoryContractAddress = msg.sender;
        deposit = _deposit;
        minNightsStay = _minNightsStay;
        rentalTitle = _rentalTitle;

       emit LogCreateRental(_rentalId, _hostAddress);
        
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
    ) public onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund) returns(bool success)
    {
        validateUpdate(_rentalId, _newHostAddress);
        validateRefundPercentages(_refundPercentages);
     
        hostAddress = _newHostAddress;
        defaultDailyRate = _defaultDailyRate;
        weekendRate = _weekendRate;
        cleaningFee = _cleaningFee;
        refundPercentages = _refundPercentages;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        isInstantBooking = _isInstantBooking;
        deposit = _deposit;
        minNightsStay = _minNightsStay;
        rentalTitle = _rentalTitle;

        emit LogUpdateRental( _rentalId, _newHostAddress);

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
            customRate[day] = _price;
          emit LogSetPriceRental(rentalId, day, _price);
        }

        return true;
    }

    /**
     * @dev function use to get price for rental in different day
     * @param _timestamp - the UNIX timestamp
     */
    function getPrice(uint256 _timestamp) public constant returns(uint256 price) {
        require(_timestamp > 0);

        if (customRate[_timestamp] > 0) 
            return customRate[_timestamp];
        else
            return defaultDailyRate;
    }
}