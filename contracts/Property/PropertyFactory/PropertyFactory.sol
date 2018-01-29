pragma solidity ^0.4.17;

import "./../../Lifecycle/Pausable.sol";
import "./../../Marketplace/IMarketplace.sol";
import "./IPropertyFactory.sol";


contract PropertyFactory is IPropertyFactory, Pausable {
    IMarketplace public marketplaceContract;

    address public marketplaceContractAddress;
    address public implContract;
    uint256 public maxBookingPeriod;

    event LogSetMaxBookingPeriod(uint256 period, address hostAddress);

    /**
     * @dev modifier ensuring that the modified method is only called by marketplace contract
     */
    modifier onlyMarketplace(bytes32 marketplaceId) {
        require(marketplaceId != "");
        require(marketplaceContractAddress == msg.sender);
        _;
    }

    /**
     * @dev modifier ensuring that the modified method is only called by approved marketplace
     */
    modifier onlyApprovedMarketplace(bytes32 marketplaceId) {
        marketplaceContract = IMarketplace(msg.sender);
        require(marketplaceContract.isApprovedMarketplace(marketplaceId));
        _;
    }

    function setImplAddress(address implAddress) public onlyOwner {
        implContract = implAddress;
    }

    function getImplAddress() public constant returns(address implAddress) {
        return implContract;
    }

    function setMarketplaceAddress(address marketplaceAddress) public onlyOwner {
        marketplaceContractAddress = marketplaceAddress;
    }

    function getMarketplaceAddress() public constant returns(address marketplaceAddress) {
        return marketplaceContractAddress;
    }

    function setMaxBookingPeriod(uint256 _maxBookingPeriod) public onlyOwner whenNotPaused returns(bool success) {
        require(_maxBookingPeriod > 0);

        maxBookingPeriod = _maxBookingPeriod;
        LogSetMaxBookingPeriod(_maxBookingPeriod, msg.sender);
        return true;
    }

    function getMaxBookingPeriod() public constant returns(uint256 _maxBookingPeriod) {
        return maxBookingPeriod;
    }
}