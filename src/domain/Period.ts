// Value Object
export default class Period {

	constructor (readonly start: Date, readonly end: Date) {
		if (start.getTime() > end.getTime()) throw new Error("Invalid period");
	}

	getDiffInDays () {
		return (this.end.getTime() - this.start.getTime())/(1000*60*60*24)
	}

	getDiffInHours () {
		return (this.end.getTime() - this.start.getTime())/(1000*60*60)
	}
}
