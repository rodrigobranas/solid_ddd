import ReservationRepository from "../infra/repository/ReservationRepository";

export default class CancelReservation {

	constructor (readonly reservationRepository: ReservationRepository) {
	}
	
	async execute (reservationId: string) {
		const reservation = await this.reservationRepository.getReservation(reservationId);
		reservation.cancel();
		await this.reservationRepository.updateReservation(reservation);
	}

}
