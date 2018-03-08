pragma solidity ^0.4.17;

import "./../Upgradeability/Forwardable.sol";
import "./HotelReservationFactory/IHotelReservationFactory.sol";

contract HotelReservationProxy is Forwardable {
	address public hotelReservationFactoryAddress;
	IHotelReservationFactory hotelReservationFactoryContract;

	function HotelReservationProxy(address _hotelReservationFactoryAddress ) public {
		hotelReservationFactoryAddress = _hotelReservationFactoryAddress;
		hotelReservationFactoryContract = IHotelReservationFactory(hotelReservationFactoryAddress);
	}

	function () payable public {
		address hotelReservationImplAddress = hotelReservationFactoryContract.getImplAddress();
        delegatedFwd(hotelReservationImplAddress, msg.data);
    }

}