# Ving

Ving is a RESTful web services framework with batteries included. It has a heavy focus on a strong and predictable backend, while having a flexible front end. It's feature's include:

 - Platform agnostic REST interface
 - Per field privileges for view and edit
 - Full session based auth system
 - API key and privilege system with access to make requests on behalf of other users
 - A useful set of custom made client components and composables
 - A full user interface for user management

Ving is a modern reimplementation of [Wing](http://wingapi.com) written entirely in [Typescript](https://www.typescriptlang.org) using [Nuxt 3](http://nuxt.com), [Vue 3](http://vuejs.org), [PrimeVue](https://primevue.org),  [PrimeFlex](https://www.primefaces.org/primeflex/) and [Drizzle](https://github.com/drizzle-team/drizzle-orm).


## Documentation

- [About](content/ving/1.index.md)
- [Install](content/ving/2.installation.md)
  - [Node Modules](content/ving/2.installation/1.node-modules.md)
  - [VS Code](content/ving/2.installation/2.vs-code.md)  
  - [MySQL](content/ving/2.installation/3.mysql.md)  
  - [CLI](content/ving/4.cli/1.node-modules.md)

And after you've done those steps, you'll be able to see our [extensive documention](content/ving) self-hosted in Ving by starting up the dev server like:

```bash
npm run dev
```