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
    address channelManager;
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

    modifier onlyValidAddresesForPrices() {
        require(msg.sender == hostAddress || msg.sender == channelManager);
        _;
    }

    function validateRentalId(bytes32 _rentalId) internal view returns(bool success) {
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
		_; 
	}

    modifier onlyValidArraysForPrices(uint[] _days, uint[] _prices) {
        require(_days.length == _prices.length);
        _;
    }

    function validateRefundPercentages( uint[] _refundPercentages) public view returns (bool success) {
		
		for (uint i = 0 ; i < _refundPercentages.length; i++) {
			require(_refundPercentages[i] <= 100 && _refundPercentages[i] >= 0 );
		}
		return true;
	}

    function setRentalArrayIndex(address _rentalFactoryContractAddress) {
        IRentalFactory rentalFactoryContract = IRentalFactory(_rentalFactoryContractAddress);
        rentalArrayIndex = rentalFactoryContract.getRentalsArrayLenght();
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
            string _rentalTitle,
            address _channelManger)
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
            rentalTitle,
            channelManager
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
        bool _isInstantBooking,
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle,
        address _channelManager
		) public onlyNewRental onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund)  returns(bool success)
	{
        validateRentalId(_rentalId);
        validateRefundPercentages(_refundPercentages);
        setRentalArrayIndex(msg.sender);

        rentalId = _rentalId;
        hostAddress = _hostAddress;
        defaultDailyRate = _defaultDailyRate;
        weekendRate = _weekendRate;
        cleaningFee = _cleaningFee;
        refundPercentages = _refundPercentages;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        isInstantBooking = _isInstantBooking;
        rentalFactoryContractAddress = msg.sender;
        deposit = _deposit;
        minNightsStay = _minNightsStay;
        rentalTitle = _rentalTitle;
        channelManager = _channelManager;

       emit LogCreateRental(_rentalId, _hostAddress);
        
		return true;
	}

    function validateUpdate(
        bytes32 _rentalId,
        address _newHostAddress,
        uint[] _refundPercentages,
        uint[] _daysBeforeStartForRefund
    ) public onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund) view onlyHost
        returns(bool success) 
    {
        require(_newHostAddress != address(0));
        require(rentalId == _rentalId);
        validateRefundPercentages(_refundPercentages);
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
        string _rentalTitle,
        address _channelManager
    ) public returns(bool success)
    {
        validateUpdate(_rentalId, _newHostAddress, _refundPercentages, _daysBeforeStartForRefund);
        
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
        channelManager = _channelManager;
        
        emit LogUpdateRental( _rentalId, _newHostAddress);

        return true;
    }

    /**
     * @dev function use to set price for rental in different days
     * @param _timestampStart - the UNIX timestamp of start point
     * @param _timestampEnd - the UNIX timestamp of end point
     * @param _price - price of rental
     */

     // This should be set from the front end. The expected params should be timestamp in seconds formated to 14:00h
    function setPrice(
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _price
    )  public onlyValidAddresesForPrices returns(bool success) 
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

    // This should be set from the front end. The expected params should be timestamp in seconds formated to 14:00h
    function setPriceForDays(
        uint[] _days,
        uint[] _prices
    ) public onlyValidAddresesForPrices onlyValidArraysForPrices(_days, _prices) returns(bool success) {

        for (uint i = 0 ; i < _days.length; i++) {
          if(  _prices[i] > 0) {
              continue;
          }
          customRate[_days[i]] = _prices[i];
          emit LogSetPriceRental(rentalId, _days[i], _prices[i]);
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