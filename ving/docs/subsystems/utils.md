---
outline: deep
---

# Utilities

There are a bunch of utilities libraries in `ving/utils` that solve common problems you may have when writing server side code. Each of them has JSDoc for the actual functional definitions, but we want to call attention tot he different utilites libraries here so you know they exist.

## Utility Libraries

### appendNumberToString

Adds a number to the end of a string, or increments it if there's already one there.

### base62

Given an input, can generate an encoded string based upon A-Z, a-z, 0-9, and _.

### fs

A bunch of wrappers around node's `fs` library to give you easy to use and terse filesystem functions for checking if a file/folder exists, or reading/writing JSON files, or sanitizing filenames, and more.

### identify

A bunch of utilites to identify whether a variable is an array, or an object or undefined, etc. You can do all this in javascript, but this ensures we do the same tests consistently through-out ving and its shorter to write too.

### int2str

Uses the base62 and skipjack utils to generate encrypted strings from integers. This is what generates the public facing IDs for Rest endpoints in Ving.

### miniHash

Provides a function to give something similar to an MD5 hash, or a SHA1 hash, but returns a shorter string (around 8 characters). This is very useful when you need to be able to disambiguate files or other content, but you also need the resulting string to be shorter than a normal file hash. Note that because it's shorter there is a greater chance of collision, but if you know the risks you can work around them.

### ouch

A way to throw standardized errors through-out ving. 

### range

Create an array of numbers to iterate over.

### rest

A bunch of utilities that provide glue between Nuxt's rest system and Ving's records. 

### skipjack

A fast 2-way encryption library to encrypt/decrypt integers to prevent outside observers from guessing the real values.

### sleep

A function for waiting for a few seconds or minutes.

## Honorable Mentions

There are a bunch of other places in the codebase that have utility functions you might end up using all over, that just aren't located in the `ving/utils` folder.

### utils

Utillities that are specifically dedicated to [UI](ui#utilities) or presentation functions.

### ving/index.mjs

Combines a bunch of commonly used ving utilities into a single roll up package.

### ving/drizzle/orm.mjs

Exports all of the useful functions from drizzle that are normally spread out across many different libraries. 

### ving/record/utils.mjs

Exports a `useKind()` function that allows you to dynamically instanciate any VingKind.

### ving/schema/helpers.mjs

Has utility functions for defining schemas.

### ving/schema/map.mjs

Has functions for finding a ving schema based upon some criteria.

