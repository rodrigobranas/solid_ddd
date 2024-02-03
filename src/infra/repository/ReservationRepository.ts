import pgp from "pg-promise";
import Reservation, { DayReservation, ReservationFactory } from "../../domain/Reservation";

export default interface ReservationRepository {
	hasActiveReservations (roomId: string, checkinDate: Date, checkoutDate: Date): Promise<boolean>;
	saveReservation (reservation: Reservation): Promise<void>;
	updateReservation (reservation: Reservation): Promise<void>;
	getReservation (reservationId: string): Promise<Reservation>;
}

export class ReservationRepositoryDatabase implements ReservationRepository {

	async hasActiveReservations(roomId: string, checkinDate: Date, checkoutDate: Date): Promise<boolean> {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const reservations = await connection.query("select * from branas.reservation where room_id = $1 and (checkin_date, checkout_date) overlaps ($2, $3) and status = 'active'", [roomId, checkinDate, checkoutDate]);
		await connection.$pool.end();
		return reservations.length > 0;
	}

	async saveReservation(reservation: Reservation): Promise<void> {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		await connection.query("insert into branas.reservation (reservation_id, room_id, email, checkin_date, checkout_date, price, status, duration) values ($1, $2, $3, $4, $5, $6, $7, $8)", [reservation.reservationId, reservation.roomId, reservation.getEmail(), reservation.checkinDate, reservation.checkoutDate, reservation.getPrice(), reservation.getStatus(), reservation.getDuration()]);
		await connection.$pool.end();
	}

	async updateReservation(reservation: Reservation): Promise<void> {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		await connection.query("update branas.reservation set status = $1 where reservation_id = $2", [reservation.getStatus(), reservation.reservationId]);
		await connection.$pool.end();
	}

	async getReservation(reservationId: string): Promise<Reservation> {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const [reservationData] = await connection.query("select r.*, o.room_id, o.type from branas.reservation r join branas.room o using (room_id) where reservation_id = $1", [reservationId]);
		await connection.$pool.end();
		return ReservationFactory.restore(reservationData.type, reservationData.reservation_id, reservationData.room_id, reservationData.email, reservationData.checkin_date, reservationData.checkout_date, reservationData.status, parseFloat(reservationData.price), parseFloat(reservationData.duration))
	}

}
	