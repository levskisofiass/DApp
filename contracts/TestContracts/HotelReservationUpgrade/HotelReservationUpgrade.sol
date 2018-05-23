pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelReservationUpgrade.sol";
import "./../../Tokens/StandardToken.sol";
import "./../../Upgradeability/SharedStorage.sol";

contract HotelReservationUpgrade is SharedStorage {
	bytes32 hotelReservationId;
	address customerAddress;
	uint reservationCostLOC;
	uint reservationStartDate;
	uint reservationEndDate;
	uint daysBeforeStartForRefund;
	uint refundPercentage;
	bytes32 hotelId;
	bytes32 roomId;
	uint numberOfTravelers;
	// address hotelReservationFactoryAddress;

	StandardToken public LOCTokenContract;
	IHotelReservationUpgrade public hotelReservationContract;

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
	event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);

	modifier onlyValidPeriodOfTime(uint _startDate, uint _endDate) {
		require(_startDate >= now);
		require(_startDate < _endDate);
		_;
	}

	function validateCancelation(address _customerAddress) {
		require(refundPercentage > 0);
		require((now + ( daysBeforeStartForRefund * 1 days )) <= reservationStartDate);
		require(customerAddress == _customerAddress);
	}

	function validatePeriodForWithdraw() {
		require(now > reservationEndDate);
	}

	function getLocToBeRefunded() public constant returns (uint _locToBeRefunded, uint _locRemainder) {
		uint locToBeRefunded = (reservationCostLOC * refundPercentage) / 100;
		uint locRemainder = reservationCostLOC - locToBeRefunded;

		return (locToBeRefunded, locRemainder);
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
		address customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercentage,
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
			refundPercentage,
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
		uint _daysBeforeStartForRefund,
		uint _refundPercentage,
		bytes32 _hotelId,
		bytes32 _roomId,
		uint _numberOfTravelers
	) public onlyValidPeriodOfTime(_reservationStartDate, _reservationEndDate) returns(bool success) 
		{
		require(_refundPercentage <= 100);

		hotelReservationId = _hotelReservationId;
		customerAddress = _customerAddress;
		reservationCostLOC = _reservationCostLOC;
		reservationStartDate = _reservationStartDate;
		reservationEndDate = _reservationEndDate;
		daysBeforeStartForRefund = _daysBeforeStartForRefund;
		refundPercentage = _refundPercentage;
		hotelId = _hotelId;
		roomId = _roomId;
		numberOfTravelers = _numberOfTravelers;

		LogCreateHotelReservation(_hotelReservationId, _customerAddress, _reservationStartDate, _reservationEndDate);
		return true;
	}

	function updateReservationCostLOC(
        uint _newPrice
		) public returns(bool success)
	{
        reservationCostLOC = _newPrice;
        
		return true;
	}
}