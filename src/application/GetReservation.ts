import crypto from "crypto";
import HotelData from "../infra/repository/ReservationRepository";

export default class GetReservation {

	constructor (readonly hotelData: HotelData) {
	}
	
	async execute (reservationId: string) {
		const reservation = await this.hotelData.getReservation(reservationId);
		return reservation;
	}

}
