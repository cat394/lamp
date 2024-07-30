export interface DatabaseConfig {
  baseUri: string;
  dataSource: string;
  database: string;
  apiKey: string;
}

export type Document = {
  _id: string;
};

export type Query = Record<string, unknown>;

export type BasicEndpoints =
	| '/find'
	| '/findOne'
	| '/insertOne'
	| '/insertMany'
	| '/updateOne'
	| '/updateMany'
	| '/deleteOne'
	| '/deleteMany';