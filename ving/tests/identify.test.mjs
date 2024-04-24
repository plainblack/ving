import { test, expect } from "vitest";
import { isArray, isBoolean, isFunction, isNil, isNull, isNumber, isObject, isString, isUndefined } from '#ving/utils/identify.mjs';

test('isArray', () => {
    expect(isArray([0, 1])).toBe(true);
    expect(isArray({ foo: 'bar' })).toBe(false);
    expect(isArray(1)).toBe(false);
    expect(isArray(0)).toBe(false);
    expect(isArray(true)).toBe(false);
    expect(isArray(false)).toBe(false);
    expect(isArray('1')).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray('')).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(() => { })).toBe(false);
});

test('isBoolean', () => {
    expect(isBoolean([0, 1])).toBe(false);
    expect(isBoolean({ foo: 'bar' })).toBe(false);
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean('1')).toBe(false);
    expect(isBoolean(undefined)).toBe(false);
    expect(isBoolean('')).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(isBoolean(() => { })).toBe(false);
});

test('isFunction', () => {
    expect(isFunction([0, 1])).toBe(false);
    expect(isFunction({ foo: 'bar' })).toBe(false);
    expect(isFunction(1)).toBe(false);
    expect(isFunction(0)).toBe(false);
    expect(isFunction(true)).toBe(false);
    expect(isFunction(false)).toBe(false);
    expect(isFunction('1')).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction('')).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(() => { })).toBe(true);
});

test('isNil', () => {
    expect(isNil([0, 1])).toBe(false);
    expect(isNil({ foo: 'bar' })).toBe(false);
    expect(isNil(1)).toBe(false);
    expect(isNil(0)).toBe(false);
    expect(isNil(true)).toBe(false);
    expect(isNil(false)).toBe(false);
    expect(isNil('1')).toBe(false);
    expect(isNil(undefined)).toBe(true);
    expect(isNil('')).toBe(true);
    expect(isNil(null)).toBe(true);
    expect(isNil(() => { })).toBe(false);
});

test('isNull', () => {
    expect(isNull([0, 1])).toBe(false);
    expect(isNull({ foo: 'bar' })).toBe(false);
    expect(isNull(1)).toBe(false);
    expect(isNull(0)).toBe(false);
    expect(isNull(true)).toBe(false);
    expect(isNull(false)).toBe(false);
    expect(isNull('1')).toBe(false);
    expect(isNull(undefined)).toBe(false);
    expect(isNull('')).toBe(false);
    expect(isNull(null)).toBe(true);
    expect(isNull(() => { })).toBe(false);
});

test('isNumber', () => {
    expect(isNumber([0, 1])).toBe(false);
    expect(isNumber({ foo: 'bar' })).toBe(false);
    expect(isNumber(1)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(false)).toBe(false);
    expect(isNumber('1')).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber('')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(() => { })).toBe(false);
});

test('isObject', () => {
    expect(isObject([0, 1])).toBe(false);
    expect(isObject({ foo: 'bar' })).toBe(true);
    expect(isObject(1)).toBe(false);
    expect(isObject(0)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject('1')).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject('')).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(() => { })).toBe(false);
});

test('isString', () => {
    expect(isString([0, 1])).toBe(false);
    expect(isString({ foo: 'bar' })).toBe(false);
    expect(isString(1)).toBe(false);
    expect(isString(0)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString('1')).toBe(true);
    expect(isString(undefined)).toBe(false);
    expect(isString('')).toBe(true);
    expect(isString(null)).toBe(false);
    expect(isString(() => { })).toBe(false);
});

test('isUndefined', () => {
    expect(isUndefined([0, 1])).toBe(false);
    expect(isUndefined({ foo: 'bar' })).toBe(false);
    expect(isUndefined(1)).toBe(false);
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined(true)).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined('1')).toBe(false);
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined('')).toBe(false);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined(() => { })).toBe(false);
});