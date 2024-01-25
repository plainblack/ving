import { test, expect } from "vitest";
import { findObject } from '../utils/findObject.mjs';

const data = [
	{ name: "foo" },
	{ name: "bar" },
];

type TestObj = {
	name: string,
};

test('findObject', () => {
	let result = findObject('name', 'bar', data);
	expect(result.name).toBe('bar');
	expect(() => findObject('name', 'barf', data)).toThrowError();
});