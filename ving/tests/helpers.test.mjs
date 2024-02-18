import { test, expect } from "vitest";
import { findObject } from '#ving/utils/findObject.mjs';

const data = [
	{ name: "foo" },
	{ name: "bar" },
];

test('findObject', () => {
	let result = findObject(data, obj => obj.name == 'bar');
	expect(result.name).toBe('bar');
	expect(() => findObject('name', 'barf', data)).toThrowError();
});