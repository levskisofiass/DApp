pragma solidity ^0.4.17;

import "./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";


/**
 * @title IPausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract IPausable is IOwnableUpgradeableImplementation {
  function pause() public;
  function unpause() public;
}