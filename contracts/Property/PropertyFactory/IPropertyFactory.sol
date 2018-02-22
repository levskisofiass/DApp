pragma solidity ^0.4.17;

import "./../../Lifecycle/IPausable.sol";


contract IPropertyFactory is IPausable {
    event LogSetMaxBookingPeriod(uint256 period, address hostAddress);

    function setImplAddress(address implAddress) public;
    function getImplAddress() public constant returns(address implAddress);

    function setMarketplaceAddress(address marketplaceAddress)  public;
    function getMarketplaceAddress() public constant returns(address marketplaceAddress);

    function setMaxBookingPeriod(uint256 _maxBookingPeriod) public returns(bool success);
    function getMaxBookingPeriod() public constant returns(uint256 _maxBookingPeriod);
}
