pragma solidity ^0.4.23;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract SimpleHotelReservation is Ownable {
	using SafeMath for uint256;

	bytes32[] public hotelReservationIds;
	uint public maxAllowedWithdrawCyclesCount;

	struct HotelReservationStruct {
		address recipientAddress;
		uint256 reservationCostLOC;
		uint dateForWithdraw;
	}

	mapping (bytes32 => HotelReservationStruct) public hotelReservations;
	ERC20 public LOCTokenContract;

	event LogCreateHotelReservation(bytes32 indexed _hotelReservationId, address indexed _customerAddress, address indexed _recipientAddress, uint _reservationEndDate, uint _reservationCostLOC);
	event LogWithdrawal(uint256 withdrawedAmount, address indexed withdrawerAddress);

	modifier onlyNotExisting(bytes32 _hotelReservationId) {
		require(hotelReservations[_hotelReservationId].recipientAddress == address(0));
		_;
	}

	modifier validateCountCycle(bytes32[] hotelReservationsArray) {
		require(hotelReservationsArray.length <= maxAllowedWithdrawCyclesCount);
		_;
	}

	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = ERC20(locTokenContractAddress);
	}

	function getHotelReservationsCount() public view returns(uint _hotelReservationCount) {
		return hotelReservationIds.length;
	}

	function validateReservationForWithdraw(bytes32 _hotelReservationId) internal returns(bool success) {
		if( hotelReservations[_hotelReservationId].recipientAddress != msg.sender || hotelReservations[_hotelReservationId].dateForWithdraw > now) {
			return false;
		}
		return true;
	}

	function setmaxAllowedWithdrawCyclesCount(uint _maxAllowedWithdrawCyclesCount) onlyOwner {
		maxAllowedWithdrawCyclesCount = _maxAllowedWithdrawCyclesCount;
	}

	function getmaxAllowedWithdrawCyclesCount() public view returns(uint _maxAllowedWithdrawCyclesCount) {
		return maxAllowedWithdrawCyclesCount;
	}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint256 _reservationCostLOC,
		uint _dateForWithdraw,
		address _recipientAddress
	) public onlyNotExisting(_hotelReservationId) returns(bool success) {
		require(_reservationCostLOC > 0);

		// hotelReservationIds.push(_hotelReservationId);
		hotelReservations[_hotelReservationId] = HotelReservationStruct({
			recipientAddress: _recipientAddress,
			reservationCostLOC: _reservationCostLOC,
			dateForWithdraw: _dateForWithdraw     
		});

		assert(LOCTokenContract.transferFrom(msg.sender, this, _reservationCostLOC));

		emit LogCreateHotelReservation(_hotelReservationId, msg.sender, _recipientAddress, _dateForWithdraw, _reservationCostLOC);
		return true;
	}

	function withdraw(bytes32[] _reservationIds) public validateCountCycle(_reservationIds) returns(bool success) {
		require(_reservationIds.length > 0);
		uint256 withdrawAmount;
		bytes32[] withdrawedReservationIds;

		for (uint i = 0 ; i < _reservationIds.length ; i++) {
			 if (!validateReservationForWithdraw(_reservationIds[i])) {
				continue;
			 }
			
			withdrawAmount = withdrawAmount.add(hotelReservations[_reservationIds[i]].reservationCostLOC);
			hotelReservations[_reservationIds[i]].reservationCostLOC = 0;
			withdrawedReservationIds.push(_reservationIds[i]);
		}
		assert(LOCTokenContract.transfer(msg.sender, withdrawAmount));
		emit LogWithdrawal(withdrawAmount, msg.sender);
		return true;
	}
}	