pragma solidity ^0.4.17;

import "./../Upgradeability/Forwardable.sol";
import "./HotelReservationFactory/IHotelReservationFactory.sol";

contract HotelReservationProxy is Forwardable {
	address public hotelReservationFactoryAddress;

	function HotelReservationProxy(address _hotelReservationFactoryAddress ) public {
		hotelReservationFactoryAddress = _hotelReservationFactoryAddress;
	}

	function () payable public {

		address hotelReservationImplAddress = IHotelReservationFactory(hotelReservationFactoryAddress).getImplAddress();
        delegatedFwd(hotelReservationImplAddress, msg.data);
    }

}