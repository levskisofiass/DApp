pragma solidity ^0.4.17;

import "./../Upgradeability/Forwardable.sol";
import "./HotelReservationFactory/IHotelReservationFactory.sol";

contract HotelReservationProxy is Forwardable {
	address public hotelReservationFactoryAddress;
	IHotelReservationFactory hotelReservationContract;

	function HotelReservationProxy(address _hotelReservationFactoryAddress ) public {
		hotelReservationFactoryAddress = _hotelReservationFactoryAddress;
		hotelReservationContract = IHotelReservationFactory(hotelReservationFactoryAddress);
	}

	function () payable public {
		address hotelReservationImplAddress = hotelReservationContract.getImplAddress();
        delegatedFwd(hotelReservationImplAddress, msg.data);
    }

}