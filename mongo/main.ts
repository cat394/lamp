import type { DatabaseConfig, Query, BasicEndpoints } from './types.ts';

export class MongoDBRequestError extends Error {
	constructor(
		public uri: string,
		public query: Query,
		public mongoErrorMessage: string
	) {
		super(
			`Database request failed: ${mongoErrorMessage}\nURI: ${
				uri === '' ? 'URI is not setted!' : uri
			}\nQuery: ${JSON.stringify(query)}`
		);
		this.name = 'DatabaseRequestError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export class MissingParameterError extends Error {
	constructor(parameter: string) {
		super(`Missing required parameter: ${parameter}`);
		this.name = 'MissingParameterError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

class MongoDBEndpoint<Endpoints extends BasicEndpoints> {
	#uri = '';
	endpoint: Endpoints | '' = '';

	constructor({ baseUri }: Pick<DatabaseConfig, 'baseUri'>) {
		this.#uri = baseUri;
	}

	get uri(): string {
		return this.#uri + this.endpoint;
	}
}

class MongoDBRequestBody {
	#body: Query;
	#apiKey: string;

	constructor({
		dataSource,
		database,
		apiKey,
	}: Pick<DatabaseConfig, 'database' | 'dataSource' | 'apiKey'>) {
		this.#body = {
			dataSource,
			database,
		};
		this.#apiKey = apiKey;
	}

	set body(newBody: Query) {
		this.#body = {
			...this.#body,
			...newBody,
		};
	}

	get body(): Query {
		return this.#body;
	}

	get requestInit(): RequestInit {
		return {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': this.#apiKey,
			},
			body: JSON.stringify(this.body),
		};
	}
}

export class MongoDBClient<Endpoints extends BasicEndpoints> {
	#dbEndpoint: MongoDBEndpoint<Endpoints>;
	#dbRequestBody: MongoDBRequestBody;

	constructor({ baseUri, dataSource, database, apiKey }: DatabaseConfig) {
		this.#dbEndpoint = new MongoDBEndpoint({ baseUri });
		this.#dbRequestBody = new MongoDBRequestBody({
			dataSource,
			database,
			apiKey,
		});
	}

	set endpoint(value: Endpoints) {
		this.#dbEndpoint.endpoint = value;
	}

	get endpoint(): string {
		return this.#dbEndpoint.endpoint;
	}

	get uri(): string {
		return this.#dbEndpoint.uri;
	}

	set query(value: Query) {
		this.#dbRequestBody.body = value;
	}

	get query(): Query {
		return this.#dbRequestBody.body;
	}

	async send<T>(): Promise<T> {
		if (this.endpoint === '') {
			throw new MissingParameterError('Endpoint');
		}
		if (!this.query) {
			throw new MissingParameterError('Query');
		}
		try {
			const response = await fetch(
				this.#dbEndpoint.uri,
				this.#dbRequestBody.requestInit
			);
			return response.json();
		} catch (err) {
			throw new MongoDBRequestError(this.uri, this.query, err);
		}
	}
}

export function createMongoDBClient<
	Endpoints extends BasicEndpoints = BasicEndpoints
>(config: DatabaseConfig) {
	return () => new MongoDBClient(config);
}

const config: DatabaseConfig = {
	baseUri: '...',
	dataSource: '...',
	database: '...',
	apiKey: '...',
};

const createDBRequest = createMongoDBClient(config);

const dbRequest = createDBRequest();

dbRequest.endpoint = '/find';

dbRequest.query = {
	collection: 'books',
};

const data = dbRequest.send();

console.log(data);
