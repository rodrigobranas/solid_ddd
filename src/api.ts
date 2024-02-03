import express from "express";
import MakeReservation from "./application/MakeReservation";
import { ReservationRepositoryDatabase } from "./infra/repository/ReservationRepository";
import CancelReservation from "./application/CancelReservation";
import GetReservation from "./application/GetReservation";
import { RoomRepositoryDatabase } from "./infra/repository/RoomRepository";
const app = express();
app.use(express.json());

const roomRepository = new RoomRepositoryDatabase();
const reservationRepository = new ReservationRepositoryDatabase();
const makeReservation = new MakeReservation(reservationRepository, roomRepository);
const cancelReservation = new CancelReservation(reservationRepository);
const getReservation = new GetReservation(reservationRepository);

app.post("/make_reservation", async function (req, res) {
	const input = req.body;
	try {
		const output = await makeReservation.execute(input);
		res.json(output);
	} catch (e: any) {
		res.status(422).json({
			message: e.message
		});
	}
});

app.post("/cancel_reservation", async function (req, res) {
	await cancelReservation.execute(req.body.reservationId);
	res.end();
});

app.get("/reservations/:reservationId", async function (req, res) {
	const output = await getReservation.execute(req.params.reservationId);
	res.json(output);
});

app.listen(3000);
