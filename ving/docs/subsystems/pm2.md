---
outline: deep
---
# PM2
[PM2 or Node Process Manager 2](https://github.com/Unitech/pm2) is a framework for managing long-running processes. We use it to manage the Ving web and jobs servers in production.

## Setup

### Install
Install PM2 globally on your server like so:

```bash
npm i -g pm2
```

### Make a Process File
There is a file called `process.json` in the root of your project. Copy that file to match the name of whatever processes you need it to run for the specific environment you're targeting. For example, it could be `prod.json` or `qa-process.json`. It's up to you.

### Edit the Process File
The process file has rules for what processes should be run, and how they should be managed. `process.json` has sane defaults, but you can change them to your liking. 

By default it will run 1 nuxt process per CPU core of your server, plus 2 job workers. [Click here](https://pm2.keymetrics.io/docs/usage/application-declaration/) for more information on how to configure PM2.

## Using PM2

*Note:* To use PM2 you need to be in the root folder of your project.

### Start the Processes

```bash
pm2 start process.json
```

### Stop the Processes

```bash
pm2 stop all
```

### View the Processes

```bash
pm2 monit
```

### More Commands

```bash
pm2 --help
pm2 [command] --help
```