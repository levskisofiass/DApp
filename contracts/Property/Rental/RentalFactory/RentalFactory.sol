pragma solidity ^0.4.23;

import "./../RentalProxy.sol";
import "./../IRental.sol";
import "./IRentalFactory.sol";
import "./../../PropertyFactory/PropertyFactory.sol";


contract RentalFactory is IRentalFactory, PropertyFactory {
    bytes32 marketplaceId;
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

    //here we set the marketplace id because there is no other way of getting it
    function setMarkeplaceId(bytes32 _marketplaceId) public {
        marketplaceId = _marketplaceId;
    }

    function getMarketplaceId() public view returns(bytes32 _marketplaceId) {
        return marketplaceId;
    }

    function getRentalsArrayLenght() public view returns(uint _rentalsArrayLength) {
       return rentalIds.length;
    }

    function addRentalToMapping(address _rentalAddress, bytes32 _rentalId) {
        rentals[_rentalId] = _rentalAddress;
        rentalIds.push(_rentalId);
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
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle,
        address _channelManager
		) public returns(bool)
	{
        require(_hostAddress != address(0));
        validateCreate(_rentalId, getMarketplaceId());

        IRental rentalContract = IRental(new RentalProxy(this));

        rentalContract.createRental(
            _rentalId,
            _hostAddress,
            _defaultDailyRate,
            _weekendRate,
            _cleaningFee,
            _refundPercentages,
            _daysBeforeStartForRefund,
            _isInstantBooking,
            _deposit,
            _minNightsStay,
            _rentalTitle,
            _channelManager
            
        );
		addRentalToMapping(rentalContract, _rentalId);

       emit LogCreateRentalContract(_rentalId, _hostAddress, rentalContract);
		return true;
	}
}