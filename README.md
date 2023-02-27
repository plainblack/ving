# Ving

Ving is a RESTful web services framework with batteries included. It has a heavy focus on a strong and predictable backend, while having a flexible front end. It's feature's include:

 - Platform agnostic REST interface
 - Per field privileges for view and edit
 - Full session based auth system
 - API key and privilege system with access to make requests on behalf of other users

Ving is a modern reimplementation of [Wing](http://wingapi.com) written entirely in [Typescript](https://www.typescriptlang.org) using [Nuxt 3](http://nuxt.com), [Vue 3](http://vuejs.org), and [Prisma 2](http://prisma.io). 

You might be wondering why REST in a world with tRPC and GraphQL. It's because REST is language agnostic, and very simple to understand. It's still the best data presentation layer when you have an API you want the general public to consume. If you're a big company, build all three, but if you're not, best to stick with the one that's easiest to use and maintain.

## Getting Started


### VSCode
Develop using [VSCode](https://code.visualstudio.com) and these plugins:

 - [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
 - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
 - [Typescript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
 - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - be sure to review the VSCode settings recommendations on that page
 - [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons) - optional, but nice

### Setup

#### Install NPM Modules

```bash
npm install
```
#### Install Your Prisma Dev Database

Create *.env* in the project root and add your dev database connection string and a shadow database.

```
DATABASE_URL="mysql://ving:vingpass@localhost:3306/ving"
SHADOW_DATABASE_URL="mysql://ving:vingpass@localhost:3306/vingshadow"
```

Change your database type in *prisma/schema.prisma* to match the database type you used in *.env*

```
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl      = env("SHADOW_DATABASE_URL")
}
```

Then install the base schema in your database.

```bash
cd prisma
rm -Rf migrations
npx prisma migrate dev
```

### Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Private Repos Only

There are commercial Font Awesome icons and commercial licenses for Tailwind UI in this repo, thus the repo and all forks must remain private.

## TODOS

 - Talk about cache setup
 - Add all the missing features from Wing



