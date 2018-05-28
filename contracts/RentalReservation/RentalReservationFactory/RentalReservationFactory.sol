pragma solidity ^0.4.23;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./../../Tokens/StandardToken.sol";
import "./../IRentalReservation.sol";
import "./../RentalReservationProxy.sol";
import "./IRentalReservationFactory.sol";
import "./../../Property/Rental/RentalFactory/IRentalFactory.sol";
import "./../../Property/Rental/IRental.sol";

contract RentalReservationFactory is IRentalReservationFactory, OwnableUpgradeableImplementation {

	address public implContract;
	bytes32[] public rentalReservationIds;

	struct RentalReservationStruct {
		address rentalReservationAddress;
		uint rentalReservationArrayIndex;

	}

    mapping (bytes32 => RentalReservationStruct) public rentalReservations;
	StandardToken public LOCTokenContract;
	IRentalFactory public rentalFactoryContract;

	event LogReservationCreated(bytes32 rentalReservationId, address _customerAddress, uint _reservationCostLOC );

	modifier onlyNotExisting(bytes32 _rentalReservationId) {
        require(rentalReservations[_rentalReservationId].rentalReservationAddress == address(0));
        _;
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

	function getRentalReservationsCount() public view returns(uint _rentalReservationCount) {
		return rentalReservationIds.length;
	}

	 function getRentalReservationContractAddress(bytes32 _rentalReservationId) public view returns(address rentalReservationContract) {
        return rentalReservations[_rentalReservationId].rentalReservationAddress;
    }



	function createRentalReservation(
		bytes32 _rentalReservationId,
		uint _checkInDate,
		uint _checkOutDate,
		uint _numberOfTravelers,
		address _rentalAddress
	) public onlyNotExisting(_rentalReservationId) returns(bool success) {
		
		RentalReservationProxy proxy = new RentalReservationProxy(this);
		IRentalReservation rentalReservationContract = IRentalReservation(proxy);

		//Calculate the reservation cost
		IRental rentalContract = IRental(_rentalAddress);
		uint vacationPeriod = (_checkOutDate - _checkInDate) / 1 days;
		uint _reservationCostLOC = rentalContract.getReservationCost(_checkInDate,vacationPeriod);
		bytes32 _rentalId = rentalContract.getRentalId();

		rentalReservationContract.createRentalReservation (
			 _rentalReservationId,
			 msg.sender,
			 _checkInDate,
			 _checkOutDate,
			 _numberOfTravelers,
			 _rentalId,
			 _reservationCostLOC
		);

	

		rentalReservationIds.push(_rentalReservationId);
		rentalReservations[_rentalReservationId] = RentalReservationStruct({
			rentalReservationAddress: rentalReservationContract,
			rentalReservationArrayIndex: (rentalReservationIds.length - 1)

		});


		assert(LOCTokenContract.transferFrom(msg.sender, address(rentalReservationContract), _reservationCostLOC));

		emit LogReservationCreated(_rentalReservationId, msg.sender, _reservationCostLOC);

		return true;
	}
}


