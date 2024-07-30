import type { Document } from './types.ts';

type ConvertDatesToStrings<T> = {
	[K in keyof T]: T[K] extends Date
		? string
		: T[K] extends object
		? ConvertDatesToStrings<T[K]>
		: T[K];
};

export type ReadSingleDocument<T extends object> = {
	document: ConvertDatesToStrings<T> & Document;
};

export type ReadMultipleDocuments<T extends object> = {
	documents: (ConvertDatesToStrings<T> & Document)[];
};

export type InsertSingleDocument = {
	insertedId: string;
};

export type InsertMultipleDocuments = {
	insertedIds: string[];
};

export type UpdateOperation = {
	matchedCount: number;
	modifiedCount: number;
};

export type DeleteOperation = {
	deletedCount: number;
};
