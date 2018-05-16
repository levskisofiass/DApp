pragma solidity ^0.4.23;

import "./../../../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../../PropertyFactory/IPropertyFactory.sol";


contract IRentalFactory is IOwnableUpgradeableImplementation, IPropertyFactory {
    event LogCreateRentalContract(bytes32 rentalId, address hostAddress, address rentalContract);

    function validateCreate(
        bytes32 rentalId,
        bytes32 marketplaceId
    ) public returns(bool success);

    function createNewRental(
        bytes32 _rentalId,
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint[] _refundPercentages,
        uint[] _daysBeforeStartForRefund,
        bool _isInstantBooking,
        uint _deposit,
        uint _minNightsStay,
        string _rentalTitle
		) public returns(bool success);

    function rentalsCount() public constant returns(uint);
    
    function getRentalId(uint index) public constant returns(bytes32);
    function getRentalContractAddress(bytes32 _rentalId) public constant returns(address rentalContract);
    function setMarkeplaceId(bytes32 _marketplaceId) public;
    function getMarketplaceId() public view returns(bytes32 _marketplaceId);
}
