# Logging
By default Ving logs to the `logs` folder. It automatically rotates its own logs.

Ving uses [Winston](https://github.com/winstonjs/winston) for logging. Winston has a lot of amazing configurability, so instead of creating a config file that cannot possibly encapsulate all of that, we leave it to you to modify `server/log.mjs`.