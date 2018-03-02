pragma solidity ^0.4.17;

import "./../HotelReservationProxy.sol";
import "./../IHotelReservation.sol";
import "./IHotelReservationFactory.sol";
import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Tokens/StandardToken.sol";

contract HotelReservationFactory is IHotelReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	bytes32[] public hotelReservationIds;
	uint public locRefundsRemainder;

	struct HotelReservationStruct {
		address hotelReservationAddress;
		uint hotelReservationArrayIndex;

	}

    mapping (bytes32 => HotelReservationStruct) public hotelReservations;
	StandardToken public LOCTokenContract;
	 

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
	event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _locRefundsRemainder);

	modifier onlyNotExisting(bytes32 _hotelReservationId) {
        require(hotelReservations[_hotelReservationId].hotelReservationAddress == address(0));
        _;
    }

	modifier onlyExisting(bytes32 _hotelReservationId) {
		require(hotelReservations[_hotelReservationId].hotelReservationAddress != address(0));
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
        return hotelReservations[_hotelReservationId].hotelReservationAddress;
    }

	function getHotelReservationsCount() public constant returns(uint) {
		return hotelReservationIds.length;
	}

	function getLocRemainderAmount() public constant returns(uint _locRefundsRemainder) {
		return locRefundsRemainder;
	}

	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = StandardToken(locTokenContractAddress);
	}

	function unlinkHotelReservation(bytes32 _hotelReservationId) private {
        bytes32 lastId = hotelReservationIds[hotelReservationIds.length-1];
		hotelReservationIds[hotelReservations[_hotelReservationId].hotelReservationArrayIndex] = lastId;
        hotelReservationIds.length--;
        hotelReservations[lastId].hotelReservationArrayIndex = hotelReservations[_hotelReservationId].hotelReservationArrayIndex;
		hotelReservations[_hotelReservationId].hotelReservationAddress = address(0);
      
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
		 msg.sender,
		 _reservationCostLOC,
		 _reservationStartDate,
		 _reservationEndDate,
		 _daysBeforeStartForRefund,
		 _refundPercentage,
		 _hotelId,
		 _roomId,
		 _numberOfTravelers
		);

	hotelReservationIds.push(_hotelReservationId);
	hotelReservations[_hotelReservationId].hotelReservationAddress = hotelReservationContract;
	hotelReservations[_hotelReservationId].hotelReservationArrayIndex = (hotelReservationIds.length - 1);
	assert(LOCTokenContract.transferFrom(msg.sender, this, _reservationCostLOC));

	LogCreateHotelReservation(_hotelReservationId, msg.sender, _reservationStartDate, _reservationEndDate);
	return true;
	}

	function cancelHotelReservation(bytes32 _hotelReservationId) onlyExisting(_hotelReservationId) returns(bool success) {

		uint locToBeRefunded;
		uint locRemainder;
		IHotelReservation hotelReservationContract = IHotelReservation(hotelReservations[_hotelReservationId].hotelReservationAddress);
		
		hotelReservationContract.validateCancelation(msg.sender);
		unlinkHotelReservation(_hotelReservationId);
		(locToBeRefunded, locRemainder) = hotelReservationContract.getLocToBeRefunded();

		assert(LOCTokenContract.transfer(hotelReservationContract.getCustomerAddress(), locToBeRefunded));
		locRefundsRemainder += locRemainder;
		LogCancelHotelReservation(_hotelReservationId, msg.sender, locRefundsRemainder);
		return true;
	}
}