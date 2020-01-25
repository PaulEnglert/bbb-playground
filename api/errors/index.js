
export class NotFoundError extends Error {
	static get name() { return "NotFoundError" };
	constructor(message) {
		super(message);
		this.name = NotFoundError.name;
	}
}

export class BadRequestError extends Error {
	static get name() { return "BadRequestError" };
	constructor(message) {
		super(message);
		this.name = BadRequestError.name;
	}
}

export class InternalServerError extends Error {
	static get name() { return "InternalServerError" };
	constructor(message) {
		super(message);
		this.name = InternalServerError.name;
	}
}