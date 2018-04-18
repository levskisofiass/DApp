pragma solidity ^0.4.17;

import "./../HotelReservationProxy.sol";
import "./../IHotelReservation.sol";
import "./IHotelReservationFactory.sol";
import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Tokens/StandardToken.sol";

contract HotelReservationFactory is IHotelReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	address public withdrawerAddress;
	address public withdrawDestinationAddress;
	bytes32[] public hotelReservationIds;
	uint public locRefundsRemainder;
	uint public maxAllowedWithdrawCyclesCount;

	struct HotelReservationStruct {
		address hotelReservationAddress;
		uint hotelReservationArrayIndex;

	}

    mapping (bytes32 => HotelReservationStruct) public hotelReservations;
	StandardToken public LOCTokenContract;
	 

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
	event LogWithdrawal(bytes32 _hotelReservationId, uint _withdrawnAmount);
	event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _locRefundsRemainder);

	modifier onlyNotExisting(bytes32 _hotelReservationId) {
        require(hotelReservations[_hotelReservationId].hotelReservationAddress == address(0));
        _;
    }

	modifier onlyWithdrawer() {
		require(msg.sender == withdrawerAddress);
		_;
	}

	modifier validateCountCycle(address[] hotelReservationsArray) {
		require(hotelReservationsArray.length <= maxAllowedWithdrawCyclesCount);
		_;
	}

	function setWithdrawerAddress(address _withdrawerAddress) public onlyOwner {
		withdrawerAddress = _withdrawerAddress;
	}

	function setWithdrawDestinationAddress(address _withdrawDestinationAddress) public onlyOwner {
		withdrawDestinationAddress = _withdrawDestinationAddress;
	}

	modifier onlyExisting(bytes32 _hotelReservationId) {
		require(hotelReservations[_hotelReservationId].hotelReservationAddress != address(0));
		_;
	}

	function setmaxAllowedWithdrawCyclesCount(uint _maxAllowedWithdrawCyclesCount) onlyOwner {
		maxAllowedWithdrawCyclesCount = _maxAllowedWithdrawCyclesCount;
	}

	function setImplAddress(address implAddress) public onlyOwner {
        implContract = implAddress;
    }

	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = StandardToken(locTokenContractAddress);
	}

    function getImplAddress() public view returns(address implAddress) {
        return implContract;
    }

	 function getHotelReservationId(uint index) public view returns(bytes32 _hotelReservaionId) {
        return hotelReservationIds[index];
    }

    function getHotelReservationContractAddress(bytes32 _hotelReservationId) public view returns(address hotelReservationContract) {
        return hotelReservations[_hotelReservationId].hotelReservationAddress;
    }

	function getHotelReservationsCount() public view returns(uint _hotelReservationCount) {
		return hotelReservationIds.length;
	}

	function getLocRemainderAmount() public view returns(uint _locRefundsRemainder) {
		return locRefundsRemainder;
	}

	function getmaxAllowedWithdrawCyclesCount() public view returns(uint _maxAllowedWithdrawCyclesCount) {
		return maxAllowedWithdrawCyclesCount;
	}

	function getWithdrawerAddress() public view returns(address _withdrawerAddress) {
		return withdrawerAddress;
	}

	function getWithdrawDestinationAddress() public view returns(address _withdrawDestinationAddress) {
		return withdrawDestinationAddress;
	}

	function unlinkHotelReservation(bytes32 _hotelReservationId) private {
        bytes32 lastId = hotelReservationIds[hotelReservationIds.length-1];
		hotelReservationIds[hotelReservations[_hotelReservationId].hotelReservationArrayIndex] = lastId;
        hotelReservationIds.length--;
        hotelReservations[lastId].hotelReservationArrayIndex = hotelReservations[_hotelReservationId].hotelReservationArrayIndex;
		hotelReservations[_hotelReservationId].hotelReservationAddress = address(0);
      
    }
	
	function validateWithdraw(address[] _hotelReservations) validateCountCycle(_hotelReservations) public view returns(bool success) {
		require(_hotelReservations.length > 0);

		for (uint i = 0 ; i < _hotelReservations.length; i++) {
			require(_hotelReservations[i] != address(0));
			IHotelReservation hotelReservationContract = IHotelReservation(_hotelReservations[i]);

			hotelReservationContract.validatePeriodForWithdraw();
			uint amountToWithdraw = hotelReservationContract.getLocForWithdraw();

		}
		return true;
	}

	function createHotelReservation(
		bytes32 _hotelReservationId,
		uint _reservationCostLOC,
		uint _reservationStartDate,
		uint _reservationEndDate,
		uint[] _daysBeforeStartForRefund,
		uint[] _refundPercentages,
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
		 _refundPercentages,
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
		
		bool isValidCancelation = hotelReservationContract.validateCancelation(msg.sender);
		require(isValidCancelation == true);
		unlinkHotelReservation(_hotelReservationId);
		(locToBeRefunded, locRemainder) = hotelReservationContract.getLocToBeRefunded();

		assert(LOCTokenContract.transfer(hotelReservationContract.getCustomerAddress(), locToBeRefunded));
		locRefundsRemainder += locRemainder;
		LogCancelHotelReservation(_hotelReservationId, msg.sender, locRefundsRemainder);
		return true;
	}

	function withdraw(address[] _hotelReservations) onlyWithdrawer validateCountCycle(_hotelReservations) returns(bool success) {

		if (locRefundsRemainder > 0) {
			uint sendRefundsRemainder = locRefundsRemainder;
			locRefundsRemainder = 0;
			assert(LOCTokenContract.transfer(withdrawDestinationAddress, sendRefundsRemainder));
		}
		
		for (uint i = 0 ; i < _hotelReservations.length; i++) {
			IHotelReservation hotelReservationContract = IHotelReservation(_hotelReservations[i]);

			hotelReservationContract.validatePeriodForWithdraw();
			uint amountToWithdraw = hotelReservationContract.getLocForWithdraw();
			bytes32 hotelReservationId = hotelReservationContract.getHotelReservationId();
			
			unlinkHotelReservation(hotelReservationId);
			assert(LOCTokenContract.transfer(withdrawDestinationAddress, amountToWithdraw));
			LogWithdrawal(hotelReservationId, amountToWithdraw);
		}
		return true;
	}
}