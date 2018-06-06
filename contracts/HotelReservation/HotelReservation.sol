pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelReservation.sol";
import "./../Tokens/StandardToken.sol";
import "./../Upgradeability/SharedStorage.sol";

contract HotelReservation is SharedStorage {
	bytes32 hotelReservationId;
	address customerAddress;
	uint reservationCostLOC;
	uint reservationStartDate; //Check-in date
	uint reservationEndDate; //Check-out date
	bytes32 hotelId;
	bytes32 roomId;
	uint numberOfTravelers;
	bool isDisputeOpen;
	address factoryAddress;
	uint[] daysBeforeStartForRefund;
	uint[] refundPercentages;

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

	modifier onlyNewReservations() {
		require(hotelReservationId == "");
		_;
	}

	modifier onlyReservationFactory() {
		require(factoryAddress == msg.sender);
		_;
	}

	function validateReservationForWithdraw() public view returns (bool success) {
		require(now > reservationEndDate);
		require(!isDisputeOpen);
	}
	
	function validateCancelation(address _customerAddress) view returns (bool success) {
		require(customerAddress == _customerAddress);
		for (uint i = 0 ; i < daysBeforeStartForRefund.length; i++) {
			if ((now + ( daysBeforeStartForRefund[i] * 1 days )) > reservationStartDate) {
				continue;
			}
			if(refundPercentages[i] <= 100 && refundPercentages[i] >= 0 ) {
					return true;
				}
		}
		return false;
	}

	function validateDispute(address _customerAddress) public view returns (bool success) {
		require(now > reservationStartDate && now < reservationEndDate);
		require(customerAddress == _customerAddress);
		require(!isDisputeOpen);

		return true ;
	}

	function validateRefundForCreation(uint[] _daysBeforeStartForRefund, uint[] _refundPercentages, uint _startDate) public view returns (bool success) {
		
		for (uint i = 0 ; i < _daysBeforeStartForRefund.length; i++) {
			require((now + ( _daysBeforeStartForRefund[i] * 1 days )) <= _startDate);
			require(_refundPercentages[i] <= 100 && _refundPercentages[i] >= 0 );
		}
		return true;
	}

	function getLocToBeRefunded() public view returns (uint _locToBeRefunded, uint _locRemainder) {

		if (reservationStartDate - (daysBeforeStartForRefund[0] * 1 days)  > now ) {
			return (reservationCostLOC , 0);
		}

		for (uint i = 0 ; i < daysBeforeStartForRefund.length; i++) {
			
			if((now + ( daysBeforeStartForRefund[i] * 1 days )) <= reservationStartDate) {

				uint locToBeRefunded = (reservationCostLOC * refundPercentages[i]) / 100;
				uint locRemainder = reservationCostLOC - locToBeRefunded;
				return (locToBeRefunded, locRemainder);
			}
		}
		return (0, 0);
	}

	function getCustomerAddress() public view returns (address _customerAddress) {
		return customerAddress;
	}

	function getLocForWithdraw() public view returns (uint _locAmountForWithdraw) {
		return reservationCostLOC;
	}

	function getHotelReservationId() public view returns (bytes32 _hotelReservationId) {
		return hotelReservationId;
	}

	function getHotelReservationCost() public view returns (uint _hotelReservationCostLOC) {
		return reservationCostLOC;
	}

	function setReservationDisputeStatus(bool _isDisputeOpen) public onlyReservationFactory {
		isDisputeOpen = _isDisputeOpen;
	}

	function getReservationDisputeStatus() public view returns (bool _isDisputeOpen) {
		return isDisputeOpen;
	}

	function getHotelReservation() public view 
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
		uint _numberOfTravelers,
		bool _isDisputeOpen)
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
			numberOfTravelers,
			isDisputeOpen);
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
	) public onlyNewReservations onlyValidPeriodOfTime(_reservationStartDate, _reservationEndDate) onlyValidArraysForCancelation(_daysBeforeStartForRefund,_refundPercentages) returns(bool success) 
		{

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
		isDisputeOpen = false;
		factoryAddress = msg.sender;

		LogCreateHotelReservation(_hotelReservationId, _customerAddress, _reservationStartDate, _reservationEndDate);
		return true;
	}

}