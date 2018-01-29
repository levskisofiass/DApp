pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../Lifecycle/IPausable.sol";

contract IMarketplace is IOwnableUpgradeableImplementation, IPausable {

    event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes32 url);
    event LogUpdateMarketplace(bytes32 marketplaceId, address newAdminAddress, bytes32 url);
	event LogApproveMarketplace(bytes32 marketplaceId);
	event LogRejectMarketplace(bytes32 marketplaceId);
	event LogChangeApprovalPolicy(bool isApprovalPolicyActive);
    event LogCreateRentalFromMarketplace(bytes32 rentalId, address hostAddress, bytes32 marketplaceId);
    event LogCreateHotelFromMarketplace(bytes32 hotelId, address hostAddress, bytes32 marketplaceId);

    function setRentalFactoryContract(address rentalFactoryContractAddress) public returns(bool success);
    function getRentalFactoryContract() public view returns(address rentalFactoryAddress);

    function setHotelFactoryContract(address hotelFactoryContractAddress) public returns(bool success);
    function getHotelFactoryContract() public view returns(address hotelFactoryContractAddress);

    function isApprovedMarketplace(bytes32 _marketplaceId) public constant returns(bool result);

    function createMarketplace(
		bytes32 _marketplaceId,
		bytes32 _url,
		bytes32 _rentalAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress
	) public returns(bool success);

    function updateMarketplace(
		bytes32 _marketplaceId,
		bytes32 _url,
		bytes32 _rentalAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress,
        address _newAdmin
    ) public returns(bool success);

    function approveMarketplace(bytes32 _marketplaceId) public returns(bool success);
    function rejectMarketplace(bytes32 _marketplaceId) public returns(bool success);

    function activateApprovalPolicy() public returns(bool success);
    function deactivateApprovalPolicy() public returns(bool success);
    function isApprovalPolicyActive() public constant returns(bool success);

    function marketplacesCount() public constant returns(uint);

    function getMarketplace(bytes32 marketplaceId) public constant
        returns(address adminAddress, bytes32 url, bytes32 rentalAPI, bytes32 disputeAPI, address exchangeContractAddress, uint marketplaceArrayIndex, bool isApproved, bool isActive);

    function getMarketplaceId(uint index) public constant returns(bytes32);

    function createRental(
        bytes32 _rentalId,
		bytes32 _marketplaceId, 
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
    ) public returns(bool success);

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice
    ) public returns (bool success);
}