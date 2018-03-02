pragma solidity ^0.4.17;

import "./../HotelReservationProxy.sol";
import "./../IHotelReservation.sol";
import "./IHotelReservationFactory.sol";
import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Tokens/StandardToken.sol";

contract HotelReservationFactory is IHotelReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	address public userToWithdraw;
	address public walletToWithdraw;
	bytes32[] public hotelReservationIds;
	uint public locRemainder;

	struct HotelReservationStruct {
		address hotelReservationAddress;
		uint hotelReservationArrayIndex;

	}

    mapping (bytes32 => HotelReservationStruct) public hotelReservations;
	StandardToken public LOCTokenContract;
	 

	event LogCreateHotelReservation(bytes32 _hotelReservationId, address _customerAddress, uint _reservationStartDate, uint _reservationEndDate);
	event LogCancelHotelReservation(bytes32 _hotelReservationId, address _customerAddress);
	event LodWithdrawal(bytes32 _hotelReservationId, uint _withdrawnAmount);

	modifier onlyNotExisting(bytes32 hotelReservationId) {
        require(hotelReservations[hotelReservationId].hotelReservationAddress == address(0));
        _;
    }

	modifier onlyWithdralUser() {
		require(msg.sender == userToWithdraw);
		_;
	}

	function setUserToWithdraw(address _userToWithdraw) onlyOwner {
		userToWithdraw = _userToWithdraw;
	}

	function setWalletToWithdraw(address _walletToWithdraw) onlyOwner {
		walletToWithdraw = _walletToWithdraw;
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
	function setLOCTokenContractAddress(address locTokenContractAddress) public onlyOwner {
		LOCTokenContract = StandardToken(locTokenContractAddress);
	}

	function unlinkHotelReservation(bytes32 _hotelReservationId) private {
		require(hotelReservations[_hotelReservationId].hotelReservationAddress != address(0));
        bytes32 lastId = hotelReservationIds[hotelReservationIds.length-1];
		hotelReservationIds[hotelReservations[_hotelReservationId].hotelReservationArrayIndex] = lastId;
        hotelReservationIds.length--;
        hotelReservations[lastId].hotelReservationArrayIndex = hotelReservations[_hotelReservationId].hotelReservationArrayIndex;
		hotelReservations[_hotelReservationId].hotelReservationAddress = address(0);
      
    }
	function calculateCyclesCount(address[] _hotelReservations) private constant  returns (uint cyclesCount) {
		if (_hotelReservations.length < 50 ) {
			return _hotelReservations.length;
		}
		return 50;
	}

	function validateWithdraw(address[] _hotelReservations) onlyWithdralUser private constant {
		calculateCyclesCount(_hotelReservations);

		for (uint i = 0 ; i < 50; i ++) {
			require(_hotelReservations[i] != address(0));
			IHotelReservation hotelReservationContract = IHotelReservation(_hotelReservations[i]);

			hotelReservationContract.validatePeriodForWithdraw();
			uint amountToWithdraw = hotelReservationContract.getLocForWithdraw();

			unlinkHotelReservation(hotelReservationContract.getHotelReservationId());
			assert(LOCTokenContract.transfer(walletToWithdraw, amountToWithdraw));

		}

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

	function cancelHotelReservation(bytes32 _hotelReservationId) returns(bool success) {

		uint locToBeRefunded;
		IHotelReservation hotelReservationContract = IHotelReservation(hotelReservations[_hotelReservationId].hotelReservationAddress);
		
		hotelReservationContract.validateCancelation(msg.sender);
		unlinkHotelReservation(_hotelReservationId);
		(locToBeRefunded, locRemainder) = hotelReservationContract.getLocToBeRefunded();

		assert(LOCTokenContract.transfer(hotelReservationContract.getCustomerAddress(), locToBeRefunded));

		LogCancelHotelReservation(_hotelReservationId, msg.sender);
		return true;
	}

	function withdraw(address[] _hotelReservations) onlyWithdralUser returns(bool success) {
		validateWithdraw(_hotelReservations);
		calculateCyclesCount(_hotelReservations);

		for (uint i = 0 ; i < 50; i ++) {
			IHotelReservation hotelReservationContract = IHotelReservation(_hotelReservations[i]);

			hotelReservationContract.validatePeriodForWithdraw();
			uint amountToWithdraw = hotelReservationContract.getLocForWithdraw();

			unlinkHotelReservation(hotelReservationContract.getHotelReservationId());
			assert(LOCTokenContract.transfer(walletToWithdraw, amountToWithdraw));
			LodWithdrawal(hotelReservationContract.getHotelReservationId(), amountToWithdraw);
		}

		return true;
	}
}