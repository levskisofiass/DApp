pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IHotelReservation.sol";
import "./../Tokens/ERC20.sol";

contract HotelReservation is OwnableUpgradeableImplementation {
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
	address hotelReservationFactoryAddress;

	ERC20 public LOCTokenContract;

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);

	modifier onlyValidPeriodOfTime(uint startDate, uint endDate) {
		require(startDate > now);
		require(startDate < endDate);
		_;
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
			msg.sender,
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
		customerAddress = msg.sender;
		reservationCostLOC = _reservationCostLOC;
		reservationStartDate = _reservationStartDate;
		reservationEndDate = _reservationEndDate;
		daysBeforeStartForRefund = _daysBeforeStartForRefund;
		refundPercentage = _refundPercentage;
		hotelId = _hotelId;
		roomId = _roomId;
		numberOfTravelers = _numberOfTravelers;

		LogCreateHotelReservation(_hotelReservationId, msg.sender, _reservationStartDate, _reservationEndDate);
		return true;
	}
}