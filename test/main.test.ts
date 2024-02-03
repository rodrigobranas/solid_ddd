import axios from "axios";

axios.defaults.validateStatus = function () {
	return true;
}

test("Não deve reservar um quarto com email inválido", async function () {
	const input = {
		roomId: "aa354842-59bf-42e6-be3a-6188dbb5fff8",
		email: "john.doe",
		checkinDate: "2024-03-03T10:00:00",
		checkoutDate: "2024-03-08T10:00:00"
	};
	const response = await axios.post("http://localhost:3000/make_reservation", input);
	expect(response.status).toBe(422);
	const output = response.data;
	expect(output.message).toBe("Invalid email");
});

test("Deve reservar um quarto por dia", async function () {
	const input = {
		roomId: "aa354842-59bf-42e6-be3a-6188dbb5fff8",
		email: "john.doe@gmail.com",
		checkinDate: "2024-03-03T10:00:00",
		checkoutDate: "2024-03-08T10:00:00"
	};
	const responseMakeReservation = await axios.post("http://localhost:3000/make_reservation", input);
	const outputMakeReservation = responseMakeReservation.data;
	expect(outputMakeReservation.reservationId).toBeDefined();
	const responseGetReservation = await axios.get(`http://localhost:3000/reservations/${outputMakeReservation.reservationId}`);
	const outputGetReservation = responseGetReservation.data;
	expect(outputGetReservation.duration).toBe(5);
	expect(outputGetReservation.price).toBe(5000);
	await axios.post("http://localhost:3000/cancel_reservation", outputMakeReservation);
});

test("Não deve reservar um quarto por dia em um período já reservado", async function () {
	const input = {
		roomId: "aa354842-59bf-42e6-be3a-6188dbb5fff8",
		email: "john.doe@gmail.com",
		checkinDate: "2024-03-03T10:00:00",
		checkoutDate: "2024-03-08T10:00:00"
	};
	const response = await axios.post("http://localhost:3000/make_reservation", input);
	const output = response.data;
	const response2 = await axios.post("http://localhost:3000/make_reservation", input);
	expect(response2.status).toBe(422);
	const output2 = response2.data;
	expect(output2.message).toBe("Room is not available");
	await axios.post("http://localhost:3000/cancel_reservation", output);
});

test("Deve reservar um quarto por hora", async function () {
	const input = {
		roomId: "d5f5c6cb-bf69-4743-a288-dafed2517e38",
		email: "john.doe@gmail.com",
		checkinDate: "2024-03-03T10:00:00",
		checkoutDate: "2024-03-03T12:00:00"
	};
	const response = await axios.post("http://localhost:3000/make_reservation", input);
	const outputMakeReservation = response.data;
	expect(outputMakeReservation.reservationId).toBeDefined();
	const responseGetReservation = await axios.get(`http://localhost:3000/reservations/${outputMakeReservation.reservationId}`);
	const outputGetReservation = responseGetReservation.data;
	expect(outputGetReservation.duration).toBe(2);
	expect(outputGetReservation.price).toBe(200);
	await axios.post("http://localhost:3000/cancel_reservation", outputMakeReservation);
});

test("Não deve reservar um quarto por hora em um período já reservado", async function () {
	const input = {
		roomId: "d5f5c6cb-bf69-4743-a288-dafed2517e38",
		email: "john.doe@gmail.com",
		checkinDate: "2024-03-03T10:00:00",
		checkoutDate: "2024-03-03T12:00:00"
	};
	const response = await axios.post("http://localhost:3000/make_reservation", input);
	const output = response.data;
	const response2 = await axios.post("http://localhost:3000/make_reservation", input);
	expect(response2.status).toBe(422);
	const output2 = response2.data;
	expect(output2.message).toBe("Room is not available");
	await axios.post("http://localhost:3000/cancel_reservation", output);
});
