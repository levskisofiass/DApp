pragma solidity ^0.4.17;

import "./../Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 */
contract IDestructible is IOwnableUpgradeableImplementation {

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() public;

  function destroyAndSend(address _recipient) public;
}