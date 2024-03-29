import { useCache } from '#ving/cache.mjs';
import { sleep } from '#ving/utils/sleep.mjs';
import { test, expect } from "vitest";

const cache = useCache();

const data = [
    { name: "foo" },
    { name: "bar" },
];

test('string to cache', async () => {
    expect(await cache.set('foo', 'bar', 200)).toBe(true);
    expect(await cache.get('foo')).toBe('bar');
});

test('cache timeout works', async () => {
    await sleep(300);
    expect(await cache.get('foo')).toBe(undefined);
});

test('object to cache', async () => {
    expect(await cache.set('foo', { bar: 'baz' }, 200)).toBe(true);
    expect(await cache.get('foo')).toEqual({ bar: 'baz' });
});
