import {
	assertArrayIncludes,
	assertEquals,
	assertObjectMatch,
} from '@std/assert';
import {
	createMongoDBClient,
	type DatabaseConfig,
	type RequestResult,
} from '../mod.ts';

interface Comment {
	name: string;
	email: string;
	movie_id: string;
	text: string;
	date: Date;
}

const API_KEY = Deno.env.get('API_KEY') ?? '';
const APP_ID = Deno.env.get('APP_ID') ?? null;

const BASE_URI = APP_ID
	? `https://ap-southeast-1.aws.data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1/action`
	: '';

Deno.test('Mongo client function test', async (t) => {
	const dabaseConfig: DatabaseConfig = {
		baseUri: BASE_URI,
		dataSource: 'Cluster0',
		database: 'sample_mflix',
		apiKey: API_KEY,
	};

	const collection = 'comments';

	const createDBRequest = createMongoDBClient(dabaseConfig);

	let commentId = '';

	const firstCommentDate = new Date();

	const comment: Comment = {
		name: 'Tester',
		email: 'test@example.com',
		movie_id: '1',
		text: 'Test description...',
		date: firstCommentDate,
	};

	const baseQuery = {
		dataSource: dabaseConfig.dataSource,
		database: dabaseConfig.database,
	};

	await t.step('insert a document', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			document: comment,
		};

		dbRequest.endpoint = '/insertOne';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/insertOne');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const data = await dbRequest.send<RequestResult.InsertSingleDocument>();

		commentId = data.insertedId;

		assertEquals(data, { insertedId: commentId });
	});

	await t.step('insert some documents', async () => {
		const otherComments: Comment[] = [
			{
				name: 'Tester2',
				email: 'test@example.com',
				movie_id: '2',
				text: 'Test description...',
				date: new Date(),
			},
			{
				name: 'Tester3',
				email: 'test@example.com',
				movie_id: '3',
				text: 'Test description...',
				date: new Date(),
			},
			{
				name: 'Tester4',
				email: 'test@example.com',
				movie_id: '4',
				text: 'Test description...',
				date: new Date(),
			},
		];

		const dbRequest = createDBRequest();

		const query = {
			collection,
			documents: otherComments,
		};

		dbRequest.endpoint = '/insertMany';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/insertMany');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const data = await dbRequest.send<RequestResult.InsertMultipleDocuments>();

		assertEquals(data.insertedIds.length, otherComments.length);
	});

	await t.step('get a document', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			filter: {
				_id: { $oid: commentId },
			},
		};

		dbRequest.endpoint = '/findOne';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/findOne');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const { document } = await dbRequest.send<
			RequestResult.ReadSingleDocument<Comment>
		>();

		const firstComment = {
			...comment,
			date: firstCommentDate.toISOString(),
		};

		assertObjectMatch(document, firstComment);
	});

	await t.step('get some documents', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			sort: { date: 1 },
			limit: 5,
		};

		dbRequest.endpoint = '/find';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/find');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const { documents } = await dbRequest.send<
			RequestResult.ReadMultipleDocuments<Comment>
		>();

		const firstComment: RequestResult.ReadMultipleDocuments<Comment>['documents'][number] =
			{
				_id: commentId,
				...comment,
				date: firstCommentDate.toISOString(),
			};

		assertArrayIncludes(documents, [firstComment]);
	});

	await t.step('update a document', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			filter: {
				_id: { $oid: commentId },
			},
			update: {
				$set: {
					text: 'Updated comment',
				},
			},
		};

		dbRequest.endpoint = '/updateOne';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/updateOne');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const response = await dbRequest.send<RequestResult.UpdateOperation>();

		assertEquals(response, {
			matchedCount: 1,
			modifiedCount: 1,
		});
	});

	await t.step('update some documents', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			filter: {
				movie_id: { $gte: '2', $lte: '4' },
			},
			update: {
				$set: {
					text: 'Updated comment',
				},
			},
		};

		dbRequest.endpoint = '/updateMany';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/updateMany');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const response = await dbRequest.send<RequestResult.UpdateOperation>();

		assertEquals(response, {
			matchedCount: 3,
			modifiedCount: 3,
		});
	});

	await t.step('delete a document', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			filter: {
				_id: { $oid: commentId },
			},
		};

		dbRequest.endpoint = '/deleteOne';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/deleteOne');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const response = await dbRequest.send<RequestResult.DeleteOperation>();

		assertEquals(response, { deletedCount: 1 });
	});

	await t.step('delete some documents', async () => {
		const dbRequest = createDBRequest();

		const query = {
			collection,
			filter: {
				email: 'test@example.com',
			},
		};

		dbRequest.endpoint = '/deleteMany';
		dbRequest.query = query;

		assertEquals(dbRequest.uri, dabaseConfig.baseUri + '/deleteMany');

		assertEquals(dbRequest.query, {
			...baseQuery,
			...query,
		});

		const data = await dbRequest.send<RequestResult.DeleteOperation>();

		assertEquals(data, {
			deletedCount: 3,
		});
	});
});
