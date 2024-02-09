# Installation

You need to choose whether you want to be able to get updates from future versions of ving or not.

## Requirements

Any modern computer should be able to run ving. But you will need to install a couple of things to get started.

 - You'll need to [download](https://nodejs.org/en) and install Node.

## Installation Variants

### If you want updates: FORK

Choose this option so you can choose to [sync](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) the changes from the main ving repo into your repository at any time in the future.


[Fork the ving repo.](https://github.com/plainblack/ving/fork)


After forking, [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) your forked repo to your computer.


### If you don't want updates: DOWNLOAD

Choose this option if you just want to use ving as a starter and don't care about what happens in the future.

[Download a zip file of the repo.](https://github.com/plainblack/ving/archive/refs/heads/main.zip)

Then unzip it.

### Either way: RENAME

Then feel free to rename the folder to whatever you are calling your project.

```bash
mv ving my-cool-project
```

## Node Modules

Type the following:

```bash
cd ving
npm install
```

## VS code

For developement we recommend [Visual Studio Code](https://code.visualstudio.com/download).

And for the best possible experience, we also recommend installing these plugins:

 - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - optional, but nice
 - [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) - optional, but nice
 - [MySQL](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-mysql-client2) - optional, but nice
 - [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) - optional, but nice
 - [Nunjucks Template Formatting](https://marketplace.visualstudio.com/items?itemName=eseom.nunjucks-template) - optional, but nice

## MySQL

You'll need to [download and install a MySQL 8 database](https://dev.mysql.com/downloads/mysql/).

> You could convert ving to Postgres or any other supported Drizzle database, but that's not on our todo list.

### Create the database

Log in to your MySQL database as the root user and then type the following:

```sql
create database ving;
CREATE USER 'ving'@'localhost' IDENTIFIED BY 'vingPass';
grant all privileges on ving.* to 'ving'@'localhost';
flush privileges;
```

> Obivously use your own username and password options, not the samples we provided here.

### Create a .env file

Create `.env` in the project root and add your dev database connection string.

```bash
DATABASE="mysql://ving:vingpass@localhost:3306/ving"
```

> Obivously modify the username, password, and database name to match what you created in the previous step.

### Create the initial tables

Now you can create the initial tables into your database using the [CLI](cli.html).

```bash
./ving.mjs drizzle --prepare
./ving.mjs drizzle --up
```

### Create First User

Also use the [CLI](cli.html) to create a user so you can log in to the web interface.

```bash
./ving.mjs user --add Admin --email you@domain.com --password 123qwe --admin
```

## Startup

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Cache
To use [Redis as your cache](cache.html), you'll need to configure it first.

## Email
Ving offers [email sending and templating](email.html), but you need to configure an SMTP server first.

## Configuring AWS
If you want to make use of AWS for things like storing file uploads in S3, then you'll also want to check out our [Pulumi](pulumi.html) integration.
