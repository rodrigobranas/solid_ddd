import crypto from "crypto";
import Room from "./Room";
import Email from "./Email";
import Period from "./Period";

// Entity Root formando um Aggregate, Facade
export default abstract class Reservation {
	private email: Email;
	protected period: Period;

	constructor (readonly reservationId: string, readonly roomId: string, email: string, readonly checkinDate: Date, readonly checkoutDate: Date, protected status: string, protected price: number = 0, protected duration: number = 0) {
		this.email = new Email(email);
		this.period = new Period(new Date(checkinDate), new Date(checkoutDate));
	}

	cancel () {
		if (this.status === "cancelled") throw new Error("Reservation is already cancelled");
		this.status = "cancelled";
	}

	getStatus () {
		return this.status;
	}

	getDuration () {
		return this.duration;
	}

	getPrice () {
		return this.price;
	}

	getEmail () {
		return this.email.getValue();
	}

	abstract calculate (room: Room): void;
}

export class DayReservation extends Reservation {
	calculate(room: Room): void {
		this.duration = this.period.getDiffInDays();
		this.price = this.duration * room.price;
	}

	static create (roomId: string, email: string, checkinDate: Date, checkoutDate: Date) {
		const reservationId = crypto.randomUUID();
		const status = "active";
		return new DayReservation(reservationId, roomId, email, checkinDate, checkoutDate, status);
	}

}

export class HourReservation extends Reservation {
	calculate(room: Room): void {
		this.duration = this.period.getDiffInHours();
		this.price = this.duration * room.price;
	}

	static create (roomId: string, email: string, checkinDate: Date, checkoutDate: Date) {
		const reservationId = crypto.randomUUID();
		const status = "active";
		return new HourReservation(reservationId, roomId, email, checkinDate, checkoutDate, status);
	}
}

export class ReservationFactory {
	static create (type: string, roomId: string, email: string, checkinDate: Date, checkoutDate: Date) {
		if (type === "day") return DayReservation.create(roomId, email, checkinDate, checkoutDate);
		if (type === "hour") return HourReservation.create(roomId, email, checkinDate, checkoutDate);
		throw new Error();
	}
	static restore (type: string, reservationId: string, roomId: string, email: string, checkinDate: Date, checkoutDate: Date, status: string, price: number, duration: number) {
		if (type === "day") return new DayReservation(reservationId, roomId, email, checkinDate, checkoutDate, status, price, duration);
		if (type === "hour") return new HourReservation(reservationId, roomId, email, checkinDate, checkoutDate, status, price, duration);
		throw new Error();
	}
}