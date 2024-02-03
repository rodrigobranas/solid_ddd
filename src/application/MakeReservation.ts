import { ReservationFactory } from "../domain/Reservation";
import ReservationRepository from "../infra/repository/ReservationRepository";
import RoomRepository from "../infra/repository/RoomRepository";

export default class MakeReservation {

	constructor (readonly reservationRepository: ReservationRepository, readonly roomRepository: RoomRepository) {
	}

	async execute (input: any) {
		const room = await this.roomRepository.getRoom(input.roomId);
		const reservation = ReservationFactory.create(room.type, room.roomId, input.email, input.checkinDate, input.checkoutDate);
		const hasActiveReservations = await this.reservationRepository.hasActiveReservations(input.roomId, input.checkinDate, input.checkoutDate);
		if (hasActiveReservations) throw new Error("Room is not available");
		reservation.calculate(room);
		await this.reservationRepository.saveReservation(reservation);
		return {
			reservationId: reservation.reservationId
		}
	}

}
