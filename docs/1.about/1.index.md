# About Ving

Ving is a RESTful web services framework with batteries included. It has a heavy focus on a strong and predictable backend, while having a flexible front end. It's feature's include:

 - Platform agnostic REST interface
 - Per field privileges for view and edit
 - Full session based auth system
 - API key and privilege system with access to make requests on behalf of other users
 - A useful set of custom made client components and composables
 - A full user interface for user management
 - Email subsystem

Ving is a modern reimplementation of [Wing](http://wingapi.com) written entirely in Javascript using [Nuxt 3](http://nuxt.com), [Vue 3](http://vuejs.org), [PrimeVue](https://primevue.org), [PrimeFlex](https://www.primefaces.org/primeflex/) and [Drizzle](https://github.com/drizzle-team/drizzle-orm).

## Why Rest?

You might be wondering why REST in a world with tRPC and GraphQL. It's because REST is language agnostic, and very simple to understand. It's still the best data presentation layer when you have an API you want the general public to consume. If you're a big company, build all three, but if you're not, best to stick with the one that's easiest to use and maintain.