pragma solidity ^0.4.17;

import "./../RentalProxy.sol";
import "./../IRental.sol";
import "./IRentalFactory.sol";
import "./../../PropertyFactory/PropertyFactory.sol";


contract RentalFactory is IRentalFactory, PropertyFactory {
    bytes32[] public rentalIds;
    mapping (bytes32 => address) public rentals;

    event LogCreateRentalContract(bytes32 rentalId, address hostAddress, address rentalContract);

    /**
     * @dev modifier ensuring that the modified method is only called for not existing rentals
     * @param rentalId - the identifier of the rental
     */
    modifier onlyNotExisting(bytes32 rentalId) {
        require(rentals[rentalId] == address(0));
        _;
    }

    function rentalsCount() public constant returns(uint) {
        return rentalIds.length;
    }

    function getRentalId(uint index) public constant returns(bytes32) {
        return rentalIds[index];
    }

    function getRentalContractAddress(bytes32 _rentalId) public constant returns(address rentalContract) {
        return rentals[_rentalId];
    }

    function validateCreate(
        bytes32 rentalId,
        bytes32 marketplaceId
    ) public 
        onlyNotExisting(rentalId)
        onlyMarketplace(marketplaceId)
        onlyApprovedMarketplace(marketplaceId)
        whenNotPaused
        returns(bool success) 
    {
        return true;
    }

    function createNewRental(
        bytes32 _rentalId,
        address _hostAddress,
		uint _defaultDailyRate,
        uint _weekendRate,
        uint _cleaningFee,
        uint[] _refundPercentages,
        uint[] _daysBeforeStartForRefund,
        bool _isInstantBooking,
        uint deposit,
        uint minNightsStay,
        string rentalTitle
		) public returns(bool success)
	{
        require(_hostAddress != address(0));
        validateCreate(_rentalId, _marketplaceId);

        RentalProxy proxy = new RentalProxy(this);
        IRental rentalContract = IRental(proxy);

        rentalContract.createRental(
            _rentalId,
            _hostAddress,
            _defaultDailyRate,
            _weekendRate,
            _cleaningFee,
            _refundPercentages,
            _daysBeforeStartForRefund,
            rentalIds.length,
            _isInstantBooking,
            deposit,
            minNightsStay,
            rentalTitle
            
        );
		rentals[_rentalId] = rentalContract;
        rentalIds.push(_rentalId);

        LogCreateRentalContract(_rentalId, _hostAddress, rentalContract);
		return true;
	}
}