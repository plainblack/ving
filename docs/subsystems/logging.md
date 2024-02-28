---
outline: deep
---
# Logging
By default Ving logs to the `logs` folder. It automatically rotates its own logs.

Ving uses [Winston](https://github.com/winstonjs/winston) for logging. Winston has a lot of amazing configurability, so instead of creating a config file that cannot possibly encapsulate all of that, we leave it to you to modify `server/log.mjs`.

## Writing To Logs
To write to a log you'd do something like this:

```js
import ving from '#ving/index.mjs';
ving.log('topic').error('Error message goes here.');
```
The parameter going into the `log()` function is there to set a topic (or category) for the log entry, and then the actual message to be logged would go inside one of the sub functions. Sub function are `info()`, `error()`, `warn()`, or `debug()`.