pragma solidity ^0.4.17;

import "./../../Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IRentalUpgrade.sol";
import "./../../Property/Rental/RentalFactory/IRentalFactory.sol";

/**
* @dev This contract is only used to test the upgreadability - DO NOT DEPLOY TO PRODUCTION
*/
contract RentalUpgrade is IRentalUpgrade, OwnableUpgradeableImplementation {
    bytes32 rentalId;
    address hostAddress;
    bytes32 marketplaceId;
    uint workingDayPrice;
    uint nonWorkingDayPrice;
    uint cleaningFee;
    uint refundPercent;
    uint daysBeforeStartForRefund;
    uint rentalArrayIndex;
    bool isInstantBooking;

    event LogCreateRental(bytes32 _rentalId, address _hostAddress);
    event LogUpdateRental(bytes32 _marketplaceId, bytes32 _rentalId, address _hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called by the host of current rental
     * @param _rentalId - the identifier of the rental
     * @param _hostAddress - the address of the host
     */
    modifier onlyHost(bytes32 _rentalId, address _hostAddress) {
        require(_rentalId != "");
        require(hostAddress == _hostAddress);
        _;
    }

    modifier onlyNewRental(bytes32 _rentalId) {
        require(_rentalId != "");
        require(rentalId == "");
        _;
    }

    function getRental() public constant
        returns(
            bytes32 _rentalId,
            address _hostAddress, 
            bytes32 _marketplaceId, 
            uint _workingDayPrice, 
            uint _nonWorkingDayPrice,
            uint _cleaningFee, 
            uint _refundPercent, 
            uint _daysBeforeStartForRefund, 
            uint _rentalArrayIndex,
            bool _isInstantBooking)
    {
        return (
            rentalId,
            hostAddress,
            marketplaceId,
            workingDayPrice,
            nonWorkingDayPrice,
            cleaningFee,
            refundPercent,
            daysBeforeStartForRefund,
            rentalArrayIndex,
            isInstantBooking
        );
    }

    function createRental(
        bytes32 _rentalId,
		bytes32 _marketplaceId, 
        address _hostAddress,
		uint _workingDayPrice,
        uint _nonWorkingDayPrice,
        uint _cleaningFee,
        uint _refundPercent,
        uint _daysBeforeStartForRefund,
        uint _rentalArrayIndex,
        bool _isInstantBooking
		) public onlyNewRental(_rentalId) returns(bool success)
	{
        rentalId = _rentalId;
        hostAddress = _hostAddress;
        marketplaceId = _marketplaceId;
        workingDayPrice = _workingDayPrice;
        nonWorkingDayPrice = _nonWorkingDayPrice;
        cleaningFee = _cleaningFee;
        refundPercent = _refundPercent;
        daysBeforeStartForRefund = _daysBeforeStartForRefund;
        rentalArrayIndex = _rentalArrayIndex;
        isInstantBooking = _isInstantBooking;

        LogCreateRental(_rentalId, _hostAddress);
        
		return true;
	}

    function updateCleaningFee(
        uint _cleaningFee
		) public returns(bool success)
	{
        cleaningFee = _cleaningFee;
        
		return true;
	}

}