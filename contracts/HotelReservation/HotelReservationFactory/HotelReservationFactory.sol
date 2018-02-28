pragma solidity ^0.4.17;

import "./../HotelReservationProxy.sol";
import "./../IHotelReservation.sol";
import "./IHotelReservationFactory.sol";
import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Tokens/ERC20.sol";

contract HotelReservationFactory is IHotelReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	bytes32[] public hotelReservationIds;
    mapping (bytes32 => address) public hotelReservations;
	ERC20 public LOCTokenContract;
	 

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);

	modifier onlyNotExisting(bytes32 hotelReservationId) {
        require(hotelReservations[hotelReservationId] == address(0));
        _;
    }

	function setImplAddress(address implAddress) public onlyOwner {
        implContract = implAddress;
    }

    function getImplAddress() public constant returns(address implAddress) {
        return implContract;
    }

	 function getHotelReservationId(uint index) public constant returns(bytes32) {
        return hotelReservationIds[index];
    }

    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public constant returns(address hotelReservationContract) {
        return hotelReservations[_hotelReservationId];
    }

	function getHotelReservationsCount() public constant returns(uint) {
		return hotelReservationIds.length;
	}
	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = ERC20(locTokenContractAddress);
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
	) public onlyNotExisting(_hotelReservationId) returns(bool success)
	{
		HotelReservationProxy proxy = new HotelReservationProxy(this);
        IHotelReservation hotelReservationContract = IHotelReservation(proxy);

		hotelReservationContract.createHotelReservation(
		 _hotelReservationId,
		 _reservationCostLOC,
		 _reservationStartDate,
		 _reservationEndDate,
		 _daysBeforeStartForRefund,
		 _refundPercentage,
		 _hotelId,
		 _roomId,
		 _numberOfTravelers
		);

	hotelReservations[_hotelReservationId] = hotelReservationContract;
    hotelReservationIds.push(_hotelReservationId);
	assert(LOCTokenContract.transferFrom(msg.sender, this, _reservationCostLOC));

	LogCreateHotelReservation(_hotelReservationId, msg.sender, _reservationStartDate, _reservationEndDate);
	return true;
	}
}