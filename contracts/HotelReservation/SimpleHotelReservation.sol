pragma solidity ^0.4.23;
import "./../Tokens/StandardToken.sol";
import "./../Ownership/NotInitedOwnable.sol";

contract SimpleHotelReservation is NotInitedOwnable {

	bytes32[] public hotelReservationIds;

	struct HotelReservationStruct {
		address recipientAddress;
		uint reservationCostLOC;
		uint dateForWithdraw;

	}

    mapping (bytes32 => HotelReservationStruct) public hotelReservations;
	StandardToken public LOCTokenContract;
	 
	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);

	constructor() public {
		owner = msg.sender;
	}

	modifier onlyNotExisting(bytes32 _hotelReservationId) {
        require(hotelReservations[_hotelReservationId].recipientAddress == address(0));
        _;
    }
	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = StandardToken(locTokenContractAddress);
	}

	function getHotelReservationsCount() public view returns(uint _hotelReservationCount) {
		return hotelReservationIds.length;
	}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint _reservationCostLOC,
		uint _dateForWithdraw,
		address _recipientAddress
	) public onlyNotExisting(_hotelReservationId) returns(bool success)
	{
	require(_reservationCostLOC > 0);

	hotelReservationIds.push(_hotelReservationId);
	hotelReservations[_hotelReservationId] = HotelReservationStruct({
            recipientAddress: _recipientAddress,
            reservationCostLOC: _reservationCostLOC,
			dateForWithdraw: _dateForWithdraw     
        });

	assert(LOCTokenContract.transferFrom(msg.sender, this, _reservationCostLOC));

	emit LogCreateHotelReservation(_hotelReservationId, msg.sender, _dateForWithdraw, _reservationCostLOC);
	return true;
	}
}	