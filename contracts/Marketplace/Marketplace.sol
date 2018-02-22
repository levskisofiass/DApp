pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IMarketplace.sol";
import "./../Lifecycle/Pausable.sol";
import "./../Property/Rental/RentalFactory/IRentalFactory.sol";
import "./../Property/Hotel/HotelFactory/IHotelFactory.sol";

contract Marketplace is IMarketplace, OwnableUpgradeableImplementation, Pausable {
    IRentalFactory public RentalFactoryContract;
    IHotelFactory public HotelFactoryContract;

    struct MarketplaceStruct {
        address adminAddress;
        bytes32 url;
        bytes32 rentalAPI;
        bytes32 disputeAPI;
        address exchangeContractAddress;
        uint marketplaceArrayIndex;
        bool isApproved;
		bool isActive;
    }

    bytes32[] public marketplaceIds;
    mapping (bytes32 => MarketplaceStruct) public marketplaces;

	bool approveOnCreation;

	event LogCreateMarketplace(bytes32 marketplaceId, address adminAddress, bytes32 url);
	event LogUpdateMarketplace(bytes32 marketplaceId, address newAdminAddress, bytes32 url);
	event LogApproveMarketplace(bytes32 marketplaceId);
	event LogRejectMarketplace(bytes32 marketplaceId);
	event LogChangeApprovalPolicy(bool isApprovalPolicyActive);
    event LogCreateRentalFromMarketplace(bytes32 rentalId, address hostAddress, bytes32 marketplaceId);
    event LogCreateHotelFromMarketplace(bytes32 hotelId, address hostAddress, bytes32 marketplaceId);

	uint public rate;

    function setRentalFactoryContract(address rentalFactoryContractAddress) public onlyOwner returns(bool success) {
        require(rentalFactoryContractAddress != address(0));
        RentalFactoryContract = IRentalFactory(rentalFactoryContractAddress);

        return true;
    }

    function setHotelFactoryContract(address hotelFactoryContractAddress) public onlyOwner returns(bool success) {
        require(hotelFactoryContractAddress != address(0));
        HotelFactoryContract = IHotelFactory(hotelFactoryContractAddress);

        return true;
    }

    function getRentalFactoryContract() view public returns(address rentalFactoryAddress) {
        return RentalFactoryContract;
    }

    function getHotelFactoryContract() view public returns(address hotelFactoryContractAddress) {
        return HotelFactoryContract;
    }

    /**
     * @dev modifier ensuring that the modified method is only called on active marketplaces
     * @param marketplaceId - the identifier of the marketplace
     */
    modifier onlyActive(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(marketplaces[marketplaceId].isActive);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called on inactive marketplaces
     * @param marketplaceId - the identifier of the marketplace
     */
    modifier onlyInactive(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(!marketplaces[marketplaceId].isActive);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called by the admin of current marketplace
     * @param marketplaceId - the identifier of the marketplace
     */
    modifier onlyAdmin(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(marketplaces[marketplaceId].adminAddress == msg.sender);
        _;
    }

    modifier onlyApproved(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(marketplaces[marketplaceId].isApproved);
        _;
    }

    function isApprovedMarketplace(bytes32 marketplaceId) public constant returns(bool result) {
        return marketplaces[marketplaceId].isApproved;
    }

    function marketplacesCount() public constant returns(uint) {
        return marketplaceIds.length;
    }

    function getMarketplace(bytes32 marketplaceId) public constant
        returns(address adminAddress, bytes32 url, bytes32 rentalAPI, bytes32 disputeAPI, address exchangeContractAddress, uint marketplaceArrayIndex, bool isApproved, bool isActive)
    {
        MarketplaceStruct storage m = marketplaces[marketplaceId];
        return (
            m.adminAddress,
            m.url,
            m.rentalAPI,
            m.disputeAPI,
            m.exchangeContractAddress,
            m.marketplaceArrayIndex,
            m.isApproved,
            m.isActive
        );
    }

    function getMarketplaceId(uint index) public constant returns(bytes32) {
        return marketplaceIds[index];
    }

	function createMarketplace(
		bytes32 _marketplaceId, 
		bytes32 _url,
		bytes32 _rentalAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress
		) public onlyInactive(_marketplaceId) whenNotPaused returns(bool success)
	{
        require(_exchangeContractAddress != address(0));
        require(_url != "");
        require(_rentalAPI != "");
        require(_disputeAPI != "");

		marketplaces[_marketplaceId] = MarketplaceStruct({
        	adminAddress: msg.sender,
			url: _url,
        	rentalAPI: _rentalAPI,
        	disputeAPI: _disputeAPI,
         	exchangeContractAddress: _exchangeContractAddress,
        	marketplaceArrayIndex: marketplaceIds.length,
        	isApproved: approveOnCreation,
			isActive: true
        });

        marketplaceIds.push(_marketplaceId);
        LogCreateMarketplace(_marketplaceId, msg.sender, _url);
		return true;
	}

    function updateMarketplace(
		bytes32 _marketplaceId, 
		bytes32 _url,
		bytes32 _rentalAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress,
        address _newAdmin
		) public onlyAdmin(_marketplaceId) onlyActive(_marketplaceId) whenNotPaused returns(bool success)
	{
        require(_url != "");
        require(_rentalAPI != "");
        require(_disputeAPI != "");
        require(_newAdmin != address(0));
        require(_exchangeContractAddress != address(0));

        MarketplaceStruct storage marketplace = marketplaces[_marketplaceId];

        marketplace.adminAddress = _newAdmin;
        marketplace.url = _url;
        marketplace.rentalAPI = _rentalAPI;
        marketplace.disputeAPI = _disputeAPI;
        marketplace.exchangeContractAddress = _exchangeContractAddress;

        LogUpdateMarketplace(_marketplaceId, _newAdmin, _url);
		return true;
	}

    function approveMarketplace(
        bytes32 _marketplaceId
        ) public onlyOwner onlyActive(_marketplaceId) whenNotPaused returns(bool success) 
    {
        marketplaces[_marketplaceId].isApproved = true;
	    LogApproveMarketplace(_marketplaceId);

        return true;
    }

    function rejectMarketplace(
        bytes32 _marketplaceId
        ) public onlyOwner onlyActive(_marketplaceId) whenNotPaused returns(bool success) 
    {
        marketplaces[_marketplaceId].isApproved = false;
	    LogRejectMarketplace(_marketplaceId);

        return true;
    }

    function activateApprovalPolicy() public onlyOwner whenNotPaused returns(bool success) {
        approveOnCreation = false;
	    LogChangeApprovalPolicy(true);

        return true;
    }

    function deactivateApprovalPolicy() public onlyOwner whenNotPaused returns(bool success) {
        approveOnCreation = true;
	    LogChangeApprovalPolicy(false);

        return true;
    }

    function isApprovalPolicyActive() public constant returns(bool) {
        return !approveOnCreation;
    }

    function createRental(
        bytes32 _rentalId,
		bytes32 _marketplaceId, 
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        bool _isInstantBooking
    ) public onlyApproved(_marketplaceId) onlyActive(_marketplaceId) whenNotPaused returns(bool success) 
    {
        RentalFactoryContract.createNewRental(
            _rentalId,
            _marketplaceId, 
            msg.sender,
            _workingDayPrice,
            _nonWorkingDayPrice,
            _cleaningFee,
            _refundPercent,
            _daysBeforeStartForRefund,
            _isInstantBooking
        );

        LogCreateRentalFromMarketplace(_rentalId, msg.sender, _marketplaceId);

        return true;
    }

    function createHotelRooms(
        bytes32 _hotelId,
		bytes32 _marketplaceId, 
        uint _roomsCount,
        bytes32 _roomsType,
        uint _workingDayPrice
    ) public onlyApproved(_marketplaceId) onlyActive(_marketplaceId) whenNotPaused returns (bool success)
    {
        HotelFactoryContract.createHotelRooms(
            _hotelId,
            _marketplaceId, 
            msg.sender,
            _roomsCount,
            _roomsType,
            _workingDayPrice
        );

        LogCreateHotelFromMarketplace(_hotelId, msg.sender, _marketplaceId);

        return true;
    }
}