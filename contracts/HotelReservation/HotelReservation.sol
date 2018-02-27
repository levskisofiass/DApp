pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelReservation.sol";

contract HotelReservation is OwnableUpgradeableImplementation {
	bytes32 hotelReservationId;
	address customerAddress;
	uint reservationCostLOC;
	uint reservationStartDate;
	uint reservationEndDate;
	uint daysBeforeStartForRefund;
	uint refundPercantage;
	bytes32 hotelId;
	bytes32 roomId;
	address hotelReservationFactoryAddress;

	event LogCreateHotelReservation(bytes32 _hotelId, bytes32 _roomId);

	modifier onlyValidPeriodOfTime(uint startDate, uint endDate) {
		require(startDate > now);
		require(startDate < endDate);
		_;
	}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		address _customerAddress,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint _daysBeforeStartForRefund,
		uint _refundPercantage,
		bytes32 _hotelId,
		bytes32 _roomId
	) public onlyValidPeriodOfTime(_reservationStartDate, _reservationEndDate) returns(bool success) 
		{
		hotelReservationId = _hotelReservationId;
		customerAddress = _customerAddress;
		reservationCostLOC = _reservationCostLOC;
		reservationStartDate = _reservationStartDate;
		reservationEndDate = _reservationEndDate;
		daysBeforeStartForRefund = _daysBeforeStartForRefund;
		refundPercantage = _refundPercantage;
		hotelId = _hotelId;
		roomId = _roomId;

		LogCreateHotelReservation(hotelId, roomId);
		return true;
	}
}