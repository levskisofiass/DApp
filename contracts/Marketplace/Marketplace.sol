pragma solidity ^0.4.23;

import "./../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IMarketplace.sol";
import "./../Lifecycle/Pausable.sol";
import "./../Property/Rental/RentalFactory/IRentalFactory.sol";
import "./../Property/Hotel/HotelFactory/IHotelFactory.sol";

contract Marketplace is IMarketplace, OwnableUpgradeableImplementation, Pausable {
    IRentalFactory public RentalFactoryContract;
    IHotelFactory public HotelFactoryContract;
    bytes32 private _rentalIdHash;

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

    modifier onlyValidMarketplace(bytes32 marketplaceId) {
        require(marketplaceId != "" , "Invalid Marketplace Id");
        require(marketplaces[marketplaceId].isApproved, "Marketplace is not approved");
        require(marketplaces[marketplaceId].isActive, "Marketplace is not active");
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
        emit LogCreateMarketplace(_marketplaceId, msg.sender, _url);
		return true;
	}

    function updateMarketplace(
		bytes32 _marketplaceId, 
		bytes32 _url,
		bytes32 _rentalAPI,
		bytes32 _disputeAPI,
		address _exchangeContractAddress,
        address _newAdmin
		) public onlyActive(_marketplaceId) onlyAdmin(_marketplaceId) whenNotPaused returns(bool success)
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

        emit LogUpdateMarketplace(_marketplaceId, _newAdmin, _url);
		return true;
	}

    function approveMarketplace(
        bytes32 _marketplaceId
        ) public onlyOwner onlyActive(_marketplaceId) whenNotPaused returns(bool success) 
    {
        marketplaces[_marketplaceId].isApproved = true;
	    emit LogApproveMarketplace(_marketplaceId);

        return true;
    }

    function rejectMarketplace(
        bytes32 _marketplaceId
        ) public onlyOwner onlyActive(_marketplaceId) whenNotPaused returns(bool success) 
    {
        marketplaces[_marketplaceId].isApproved = false;
	    emit LogRejectMarketplace(_marketplaceId);

        return true;
    }

    function activateApprovalPolicy() public onlyOwner whenNotPaused returns(bool success) {
        approveOnCreation = false;
	    emit LogChangeApprovalPolicy(true);

        return true;
    }

    function deactivateApprovalPolicy() public onlyOwner whenNotPaused returns(bool success) {
        approveOnCreation = true;
	    emit LogChangeApprovalPolicy(false);

        return true;
    }

    function isApprovalPolicyActive() public constant returns(bool) {
        return !approveOnCreation;
    }

    function getRentalAndMarketplaceHash(bytes32 _rentalId, bytes32 _marketplaceId) public pure returns(bytes32 _rentalIdHash) {
        return keccak256(_rentalId,_marketplaceId);
    }

    function createRental(
        bytes32 _rentalId,
		bytes32 _marketplaceId, 
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

    ) public onlyValidMarketplace(_marketplaceId) whenNotPaused returns(bool success) 
    {
        require(_rentalId != "");
        _rentalIdHash = getRentalAndMarketplaceHash(_rentalId,_marketplaceId);

        RentalFactoryContract.setMarkeplaceId(_marketplaceId);

        RentalFactoryContract.createNewRental(
            _rentalIdHash,
            msg.sender,
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

        emit LogCreateRentalFromMarketplace(_rentalId, msg.sender, _marketplaceId);

        return true;
    }

}