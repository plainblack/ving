import { findObject } from '../server/helpers';
import { test, expect } from "vitest";

const data = [
	{ name: "foo" },
	{ name: "bar" },
];

type TestObj = {
	name: string,
};

test('findObject', () => {
	let result = findObject<TestObj>('name', 'bar', data);
	expect(result.name).toBe('bar');
	expect(() => findObject<TestObj>('name', 'barf', data)).toThrowError();
});