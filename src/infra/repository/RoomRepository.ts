import pgp from "pg-promise";
import Room from "../../domain/Room";

export default interface RoomRepository {
	getRoom (roomId: string): Promise<Room>;
}

export class RoomRepositoryDatabase implements RoomRepository {
	async getRoom(roomId: string): Promise<Room> {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const [room] = await connection.query("select * from branas.room where room_id = $1", [roomId]);
		await connection.$pool.end();
		return new Room(room.room_id, room.type, parseFloat(room.price));
	}

}
	