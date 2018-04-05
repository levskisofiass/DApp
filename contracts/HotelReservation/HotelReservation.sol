pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelReservation.sol";
import "./../Tokens/StandardToken.sol";

contract HotelReservation is OwnableUpgradeableImplementation {
	bytes32 hotelReservationId;
	address customerAddress;
	uint reservationCostLOC;
	uint reservationStartDate;
	uint reservationEndDate;
	uint[] daysBeforeStartForRefund;
	uint[] refundPercentages;
	bytes32 hotelId;
	bytes32 roomId;
	uint numberOfTravelers;
	// address hotelReservationFactoryAddress;

	StandardToken public LOCTokenContract;
	IHotelReservation public hotelReservationContract;

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
	event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);

	modifier onlyValidPeriodOfTime(uint _startDate, uint _endDate) {
		require(_startDate >= now);
		require(_startDate < _endDate);
		_;
	}

	modifier onlyValidArraysForCancelation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages) {
		require(_daysBeforeStartForRefund.length == _refundPercentages.length);
		require(_daysBeforeStartForRefund.length > 0 && _daysBeforeStartForRefund.length <= 7);
		require(_refundPercentages.length > 0 && _refundPercentages.length <= 7);
		_; 
	}

	function validateCancelation(address _customerAddress) constant returns (bool success) {
		require(customerAddress == _customerAddress);
		// validateRefundForCreation(daysBeforeStartForRefund,refundPercentages, reservationStartDate );
		for (uint i = 0 ; i < daysBeforeStartForRefund.length; i ++) {
			if ((now + ( daysBeforeStartForRefund[i] * 1 days )) <= reservationStartDate) {
				if(refundPercentages[i] <= 100 && refundPercentages[i] > 0 ) {
					return true;
				}
			}
		}
		return false;
	}

	function validatePeriodForWithdraw() {
		require(now > reservationEndDate);
	}

	function validateRefundForCreation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages, uint _startDate) constant {
		
		for (uint i = 0 ; i < _daysBeforeStartForRefund.length; i ++) {
			require((now + ( _daysBeforeStartForRefund[i] * 1 days )) <= _startDate);
			require(_refundPercentages[i] <= 100 && _refundPercentages[i] >= 0 );
		}

	}

	function getLocToBeRefunded() public constant returns (uint _locToBeRefunded, uint _locRemainder) {

		for (uint i = 0 ; i < daysBeforeStartForRefund.length; i ++) {
			
			if((now + ( daysBeforeStartForRefund[i] * 1 days )) <= reservationStartDate) {
				uint locToBeRefunded = (reservationCostLOC * refundPercentages[i]) / 100;
				uint locRemainder = reservationCostLOC - locToBeRefunded;
				return (locToBeRefunded, locRemainder);
			}
		}
		return (0, 0);
	}

	function getCustomerAddress() public constant returns (address _customerAddress) {
		return customerAddress;
	}

	function getLocForWithdraw() returns (uint _locAmountForWithdraw) {
		return reservationCostLOC;
	}

	function getHotelReservationId() returns (bytes32 _hotelReservationId) {
		return hotelReservationId;
	}

	function getHotelReservation() public constant 
	returns(
		bytes32 _hotelReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers)
		{
			return (
			hotelReservationId,
			customerAddress,
			reservationCostLOC,
			reservationStartDate,
			reservationEndDate,
			daysBeforeStartForRefund,
			refundPercentages,
			hotelId,
			roomId,
			numberOfTravelers);
		}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public onlyValidPeriodOfTime(_reservationStartDate, _reservationEndDate) onlyValidArraysForCancelation(_daysBeforeStartForRefund,_refundPercentages) returns(bool success) 
		{
		validateRefundForCreation(_daysBeforeStartForRefund,_refundPercentages, _reservationStartDate);

		hotelReservationId = _hotelReservationId;
		customerAddress = _customerAddress;
		reservationCostLOC = _reservationCostLOC;
		reservationStartDate = _reservationStartDate;
		reservationEndDate = _reservationEndDate;
		daysBeforeStartForRefund = _daysBeforeStartForRefund;
		refundPercentages = _refundPercentages;
		hotelId = _hotelId;
		roomId = _roomId;
		numberOfTravelers = _numberOfTravelers;

		LogCreateHotelReservation(_hotelReservationId, _customerAddress, _reservationStartDate, _reservationEndDate);
		return true;
	}

}