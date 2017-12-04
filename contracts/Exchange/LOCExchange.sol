pragma solidity ^0.4.17;

import './../Lifecycle/Ownable.sol';
import './../Lifecycle/PausableBasic.sol';
import './Oraclized.sol';
import './../Lifecycle/Destructible.sol';
import './../tokens/ERC20.sol';
import './../Math/SafeMath.sol';

/**
 * @title LOCExchange
 * @dev Contract for exchanging LOC to ETH
 * Allows for exchanging LOCwei to wei
 */
contract LOCExchange is Ownable, PausableBasic, Destructible, Oraclized {
    ERC20 public LOCTokenContract;

    event LogLocExchanged(uint locWei, uint ethWei, uint rate);
    event LogLocWithdrawal(uint locWei);
    event LogETHWithdrawal(uint ethWei);

    function LOCExchange(address initialOracle, address locTokenContractAddress) Oraclized(initialOracle) public {
        LOCTokenContract = ERC20(locTokenContractAddress);
    }

    /**
     * @dev Function used to find out how much Loc must be approved/allowed to get certain amount of wei
     */
    function weiToLocWei(uint weiAmount) constant public whenNotPaused returns(uint) {
        uint convertedWeiAmount = weiAmount / this.minWeiAmount();
        return SafeMath.mul(convertedWeiAmount, this.rate());
    } 

    /**
     * @dev Function used to find out how much Wei must be send by given locWei
     */
    function locWeiToWei(uint locWeiAmount) constant public whenNotPaused returns(uint) {
        uint rate = this.rate();
        uint minWeiAmount = this.minWeiAmount();

        uint weiAmount = locWeiAmount / rate;
        if ((locWeiAmount % rate) != 0) {
            weiAmount++;
        } 

        weiAmount *= minWeiAmount;
        return weiAmount;
    } 

    /**
     * @dev Transfer to this contract certain amount of LOCWei and send back ETHWei to the message sender
     */
    function exchangeLocWeiToEthWei(uint locWei) public whenNotPaused returns(uint) {
        require(locWei >= this.rate());

        assert(LOCTokenContract.transferFrom(msg.sender, this, locWei));
        uint ethWeiToSend = this.locWeiToWei(locWei);
        msg.sender.transfer(ethWeiToSend);

        LogLocExchanged(locWei, ethWeiToSend, this.rate());

        return ethWeiToSend;
    }

    /**
     * @dev Send given amount of LOC from this contract to the owner
     */
    function withdrawLOC(uint locWeiWithdrawAmount) public whenNotPaused onlyOwner returns(uint) {
        require(LOCTokenContract.balanceOf(this) >= locWeiWithdrawAmount);

        assert(LOCTokenContract.transfer(msg.sender, locWeiWithdrawAmount));
        LogLocWithdrawal(locWeiWithdrawAmount);
        return locWeiWithdrawAmount;
    }

    /**
     * @dev Sends given amount of ETH from this contract to the owner
     */
    function withdrawETH(uint weiWithdrawAmount) public whenNotPaused onlyOwner returns(uint) {
        require(this.balance >= weiWithdrawAmount);
        msg.sender.transfer(weiWithdrawAmount);

        LogETHWithdrawal(weiWithdrawAmount);

        return weiWithdrawAmount;
    }

    /**
     * @dev Get the loc balance from the LOC token contract
     */
    function getLocBalance() constant public whenNotPaused returns(uint) {
       return LOCTokenContract.balanceOf(this);
    }

    /**
     * @dev Receives ether
     */
    function () payable public whenNotPaused {
    }
}