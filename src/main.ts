import express from "express";
import pgp from "pg-promise";
import crypto from "crypto";
const app = express();
app.use(express.json());

app.post("/make_reservation", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	try {
		if (!req.body.email.match(/^(.+)@(.+)$/)) {
			return res.status(422).json({
				message: "Invalid email"
			});
		}
		const reservationId = crypto.randomUUID();
		const [room] = await connection.query("select * from branas.room where room_id = $1", [req.body.roomId]);
		const reservations = await connection.query("select * from branas.reservation where room_id = $1 and (checkin_date, checkout_date) overlaps ($2, $3) and status = 'active'", [req.body.roomId, req.body.checkinDate, req.body.checkoutDate]);
		const isAvailable = reservations.length === 0;
		if (!isAvailable) {
			return res.status(422).json({
				message: "Room is not available"
			});
		}
		let price = 0;
		let duration = 0;
		if (room.type === "day") {
			duration = (new Date(req.body.checkoutDate).getTime() - new Date(req.body.checkinDate).getTime())/(1000*60*60*24);
			price = duration * parseFloat(room.price);
		}
		if (room.type === "hour") {
			duration = (new Date(req.body.checkoutDate).getTime() - new Date(req.body.checkinDate).getTime())/(1000*60*60);
			price = duration * parseFloat(room.price);
		}
		await connection.query("insert into branas.reservation (reservation_id, room_id, email, checkin_date, checkout_date, price, status) values ($1, $2, $3, $4, $5, $6, $7)", [reservationId, room.room_id, req.body.email, req.body.checkinDate, req.body.checkoutDate, price, "active"]);
		res.json({
			reservationId,
			isAvailable,
			duration,
			price
		});
	} finally {
		await connection.$pool.end();
	}
});

app.post("/cancel_reservation", async function (req, res) {
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	await connection.query("update branas.reservation set status = 'cancelled' where reservation_id = $1", [req.body.reservationId]);
	await connection.$pool.end();
	res.end();
});

app.listen(3000);
