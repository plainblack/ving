---
outline: deep
---
# Installation

Any modern computer can run Ving, but it needs 3 prerequistes:

- Node 20
- Redis 7
- MySQL 8

## Node 20

You will need to [download and install Node.js](https://nodejs.org/en). You'll need at least Node 20. 

You can install it via a GUI installer using the link above, but if you want to do it quickly via the command line follow these steps:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -e "console.log('Running Node.js ' + process.version)"
```

## Ving Source Code
Rather than acting as a library, Ving is considered to be a living code-base where your app is just a continued fork of ving, and thus you can upgrade to the latest version using git.

### Fork the Repository

You need to fork the Ving source code so you can choose to [sync](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) the changes from the main ving repo into your repository at any time in the future.

[Fork the ving repo.](https://github.com/plainblack/ving/fork)

### Clone the Repository

After forking, [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) your forked repo to your computer.

### Rename your Repository

Then rename the folder to whatever you are calling your project.

```bash
mv ving my-cool-project
```

## Node Modules

Type the following:

```bash
cd my-cool-project
npm install
```

## Create your .env file
All of Ving's secrets and variables that can change in various environments like dev to prod are stored in a `.env` file in the root of your project. You can read more about [environment variables here](env).

Go ahead and create your `.env` file now and we'll add to it in the next few sections.

```bash
echo "VING_SITE_URL=http://localhost:3000" >> .env
echo "VING_SKIPJACK_KEY=\"$((RANDOM)),$((RANDOM)),$((RANDOM)),$((RANDOM)),$((RANDOM))\"" >> .env
```


## Redis
You'll need to [download and install Redis 7](https://redis.com/redis-enterprise-software/download-center/software/). Ving uses for the [cache](subsystems/cache), the [message bus](subsystems/messagebus), and the [jobs system](subsystems/jobs) subsystems. 


### Update your .env file

Configuring Ving to use Redis is pretty simple. Just add a connection string that points to your Redis server:

```bash
VING_REDIS="redis://localhost:6379"
```
You can also include username and password like this:
```bash
VING_REDIS="redis://user:pass@localhost:6379"
```

> **NOTE:** You must enable the setting `maxmemory-policy=noeviction` in your Redis server to prevent it from automatically deleting keys when memory runs low as this will cause problems with the [jobs system](subsystems/jobs).

## MySQL

You'll need to [download and install a MySQL 8 database](https://dev.mysql.com/downloads/mysql/).

> You could convert ving to Postgres or any other supported Drizzle database, but that's not on our todo list.

### Create the database

Log in to your MySQL database as the root user and then type the following:

```sql
create database mycoolproject;
CREATE USER 'mycooluser'@'localhost' IDENTIFIED BY 'mycoolpass';
grant all privileges on mycoolproject.* to 'mycooluser'@'localhost';
flush privileges;
```

> Use your own username and password options, not the samples we provided here.

### Update your .env file

Update your `.env` to add your dev database connection string:

```bash
VING_MYSQL="mysql://mycooluser:mycoolpass@localhost:3306/mycoolproject"
```

> Modify the username, password, and database name to match what you created in the previous step.

### Create the initial tables

Now you can create the initial tables into your database using the [CLI](subsystems/cli).

```bash
./ving.mjs drizzle --prepare
./ving.mjs drizzle --up
```

## Create First User

Also use the [CLI](subsystems/cli) to create a user so you can log in to the web interface.

```bash
./ving.mjs user --add Admin --email you@domain.com --password 123qwe --admin
```

## Startup

Start the development server on `http://localhost:3000`

```bash
npm run dev
```

## Optional Extras
To make full use of all of Ving's features, there are other things you'll need to configure:

- Ving offers [email sending and templating](subsystems/email), but you need to configure an SMTP server first.
- If you want to make use of AWS for things like storing file uploads in S3, then you'll also want to check out our [CDK](subsystems/cdk) integration.


## VS code

For developement we recommend [Visual Studio Code](https://code.visualstudio.com/download).

And for the best possible experience, we also recommend installing these optional but nice plugins:

 - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
 - [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)
 - [MySQL](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-mysql-client2)
 - [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify)
 - [Nunjucks Template Formatting](https://marketplace.visualstudio.com/items?itemName=eseom.nunjucks-template)
 - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
