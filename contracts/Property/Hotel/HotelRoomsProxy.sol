pragma solidity ^0.4.17;

import "./../../Upgradeability/Forwardable.sol";
import "./HotelFactory/IHotelFactory.sol";

contract HotelRoomsProxy is Forwardable {
	address public hotelFactoryAddress;
	IHotelFactory hotelFactoryContract;

	function HotelRoomsProxy(address _hotelFactoryAddress) public {
		hotelFactoryAddress = _hotelFactoryAddress;
		hotelFactoryContract = IHotelFactory(hotelFactoryAddress);
	}

	/**
    * @dev All calls made to the proxy are forwarded to the contract implementation via a delegatecall
    * @return Any bytes32 value the implementation returns
    */
    function () payable public {
		address hotelRoomsImplAddress = hotelFactoryContract.getImplAddress();
        delegatedFwd(hotelRoomsImplAddress);
    }
}