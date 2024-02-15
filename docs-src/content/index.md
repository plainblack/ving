# About Ving

Ving is a Web and REST code generation tool and services framework. It has a heavy focus on a strong and predictable backend, while having a flexible front end. It's feature's include:

 - Automatic code generation for all sub-systems
 - Platform agnostic REST interface
 - Per field privileges for view and edit
 - Full session based auth system
 - An AWS S3 based secure upload system
 - API key and privilege system with access to make requests on behalf of other users
 - A useful set of custom made client components and composables
 - A full user interface for user management
 - Email subsystem

Ving is written entirely in Javascript using [Nuxt 3](http://nuxt.com), [Vue 3](http://vuejs.org), [PrimeVue](https://primevue.org), [PrimeFlex](https://www.primefaces.org/primeflex/) and [Drizzle](https://github.com/drizzle-team/drizzle-orm).


## How Ving is Constructed
Everything starts with the [Ving Schema](ving-schema.html), which defines tables in a database, along with fields, privileges, and other properties. From there everything is automatically generated, but still modifyable by you. Ving will generate [database schemas and migrations](drizzle.html), [server-side Javascript APIs](ving-record.html), [REST APIs](rest.html), [Web UIs](ui.html), [email templates](email.html), and more.


## Why Rest?
You might be wondering why REST in a world with tRPC and GraphQL. It's because REST is language agnostic, and very simple to understand. It's still the best data presentation layer when you have an API you want the general public to consume. And Ving is all about being fast to implement and easy to maintain. When you want simplcity, you do not want GraphQL or Typescript as there's nothing uncomplicated about either.


## Get the Code
You can [visit the GitHub repository](https://github.com/plainblack/ving) to get the source code and start using it.