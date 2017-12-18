pragma solidity ^0.4.17;

import "./../Lifecycle/Ownable.sol";
import './../Lifecycle/PausableBasic.sol';

/**
 * @title ExchangeOracle
 * @dev Oracle for the LOC exchange rate
 * Allows setting Wei to LOCwei rate
 */
contract ExchangeOracle is Ownable, PausableBasic {

	bool public isLocOracle = true;

    uint public rate = 0; // LockWei(18 decimals) per 1000 Wei(21 decimals)
	uint public minWeiAmount = 1000; 

	event LogRateChanged(uint oldRate, uint newRate, address changer);
	event LogMinWeiAmountChanged(uint oldMinWeiAmount, uint newMinWeiAmount, address changer);

	function ExchangeOracle(uint initialRate) public {
		require(initialRate > 0);
		rate = initialRate;
	}

	function rate() public constant whenNotPaused returns(uint) {
		return rate;
	}

	function setRate(uint newRate) public onlyOwner whenNotPaused returns(bool) {
		require(newRate > 0);
		uint oldRate = rate;
		rate = newRate;
		LogRateChanged(oldRate, newRate, msg.sender);
		return true;
	}

	function setMinWeiAmount(uint newMinWeiAmount) public onlyOwner whenNotPaused returns(bool) {
		require(newMinWeiAmount > 0);
		uint oldMinWeiAmount = minWeiAmount;
		minWeiAmount = newMinWeiAmount;
		LogMinWeiAmountChanged(minWeiAmount, oldMinWeiAmount, msg.sender);
		return true;
	}
}