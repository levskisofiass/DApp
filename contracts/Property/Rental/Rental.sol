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

  
    /**
     * @dev modifier ensuring that the modified method is only called by the host of current rental
     */
    modifier onlyHost() {
        require(msg.sender == hostAddress);
        _;
    }

    modifier onlyPriceSetterAddress() {
        require(msg.sender == hostAddress || msg.sender == channelManager);
        _;
    }

    function validateRentalId(bytes32 _rentalId) internal view returns(bool success) {
        require(_rentalId != "");
    }

    modifier onlyNewRental() {
        require(rentalId == "");
        _;
    }
    function onlyValidArraysForCancelation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages) internal {
		require(_daysBeforeStartForRefund.length == _refundPercentages.length);
		require(_daysBeforeStartForRefund.length > 0 && _daysBeforeStartForRefund.length <= 7);
		
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

    function getChannelManager() public view returns (address _channelManager) {
        return channelManager;
    } 

    //We are setting the array index of each rental in a separate function, because of the limit for local variables in each function
    function setRentalArrayIndex(address _rentalFactoryContractAddress) internal {
        IRentalFactory rentalFactoryContract = IRentalFactory(_rentalFactoryContractAddress);
        rentalArrayIndex = rentalFactoryContract.getRentalsArrayLength();
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
        bool _isInstantBooking,
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle,
        address _channelManager
		) public onlyNewRental returns(bool success)
	{
        validateRentalId(_rentalId);
        validateRefundPercentages(_refundPercentages);
        setRentalArrayIndex(msg.sender);
        onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund); 

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
    ) public view onlyHost
        returns(bool success) 
    {
        require(_newHostAddress != address(0));
        require(rentalId == _rentalId);
        validateRefundPercentages(_refundPercentages);
        onlyValidArraysForCancelation(_refundPercentages, _daysBeforeStartForRefund);
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
     * @dev function use to set price for rental for period
     * @param _timestampStart - the UNIX timestamp of start point, the timestamp should be in seconds formatted to 14:00h UTC
     * @param _timestampEnd - the UNIX timestamp of end point, the timestamp should be in seconds formatted to 14:00h UTC
     * @param _price - price of rental
     * This function should be called / set from the frontend
     */

    function setPrice(
        uint256 _timestampStart,
        uint256 _timestampEnd,
        uint256 _price
    )  public onlyPriceSetterAddress returns(bool success) 
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
     * @dev function use to set price for rental in specific days
     * @param _days - the timestamp of the day we want to set the price for, should be in seconds formatted to 14:00h UTC
     * @param _prices - price of rental for the spesific day
     * This function should be called / set from the frontend
     */
    function setPriceForDays(
        uint[] _days,
        uint[] _prices
    ) public onlyPriceSetterAddress onlyValidArraysForPrices(_days, _prices) returns(bool success) {
        IRentalFactory rentalFactoryContract = IRentalFactory(rentalFactoryContractAddress);
        require(_days.length <= rentalFactoryContract.getMaxBookingPeriod());
        for (uint i = 0 ; i < _days.length; i++) {
          if(  _prices[i] < 0) {
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