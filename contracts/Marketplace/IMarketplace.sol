pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";
import "./../Lifecycle/IPausable.sol";

contract IMarketplace is IOwnableUpgradeableImplementation, IPausable {

    event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes32 url);
    event LogUpdateMarketplace(bytes32 marketplaceId, address newAdminAddress, bytes32 url);
	event LogApproveMarketplace(bytes32 marketplaceId);
	event LogRejectMarketplace(bytes32 marketplaceId);
	event LogChangeApprovalPolicy(bool isApprovalPolicyActive);
    event LogCreatePropertyFromMarketplace(bytes32 propertyId, address hostAddress, bytes32 marketplaceId);

    function init(address propertyContractAddress) public;

    function isMarketplace() public constant returns(bool result);

    function isApprovedMarketplace(bytes32 _marketplaceId) public constant returns(bool result);

    function createMarketplace(
		bytes32 _marketplaceId,
		bytes32 _url,
		bytes32 _propertyAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress
	) public returns(bool success);

    function updateMarketplace(
		bytes32 _marketplaceId,
		bytes32 _url,
		bytes32 _propertyAPI,
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
        returns(address adminAddress, bytes32 url, bytes32 propertyAPI, bytes32 disputeAPI, address exchangeContractAddress, uint marketplaceArrayIndex, bool isApproved, bool isActive);

    function getMarketplaceId(uint index) public constant returns(bytes32);

    function createProperty(
        bytes32 _propertyId,
		bytes32 _marketplaceId, 
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
    ) public returns(bool success);
}