---
outline: deep
---
# Cache

By default ving uses an in-memory cache that goes away every time you restart your server. That's fine for early development, but you get logged out everytime you restart your server, so you're going to want to set up a Redis cache as soon as you can.

## Setting Up Redis
To use a Redis cache, you must first have a [Redis](https://redis.com) server. Then you simply need to add an entry in `.env` that points to your Redis server like so:

```
VING_REDIS="redis://@localhost:6379"
```

You can include a username and password in the URL like so:

```
VING_REDIS="redis://user:pass@localhost:6379"
```

## Using the Cache
You can access the cache via the [CLI](cli), but for the most of your work you'll want to programatically access the cache. Here's a quick code example to show you how it works:

```js
import {useCache} from '#ving/cache.mjs';
const cache = useCache();
await cache.set('foo', 'bar', 60 * 60 * 1000); // set `bar` in key `foo` for 1 hour
const foo = await cache.get('foo'); // fetch `bar` from cache
await cache.delete('foo'); // delete the value associated with `foo`
```