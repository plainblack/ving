---
outline: deep
---
# Architecture

Ving's architecture is made up of many components in many different layers. It's a complex web of systems that enables you to build really complex web-apps really quickly.

```
Presentation:   PrimeVue
                -----------------------------
Client:         Nuxt Pages + Vue
                -----------------------------
Server:         Nuxt SSR + Rest + Job Workers
                -----------------------------
Application:    Drizzle + Ving Record + Jobs
                -----------------------------
Foundation:     Ving Schema + Bull MQ
                -----------------------------
Storage:        MySQL + Redis + S3
```

## Storage
At its most basic, there is a storage layer that consists of MySQL, Redis, and AWS S3.

## Foundation

At the very heart of Ving are [Ving Schemas](subsystems/ving-schema). From the ving schema, everything else can be generated and configured. The ving schema sets up database tables, data validation, permissions, and more. Everything in the system can trace back to the ving schema.

## Application

At the application layer are [the various subsystems that make up Ving](subsystems/cache). It starts with the [Drizzle ORM](subsystems/drizzle), but extends out to a [caching system](subsystems/cache), and ultimately culminates in the storage of all business logic in ving through the [Ving Records](subsystems/ving-record).

## Server

At the server level Nuxt runs the [REST interface](subsystems/rest) and Server Side Rendering (SSR) of [Pages](subsystems/ui#pages). There is also [a Jobs service](subsystems/jobs) based upon Bull MQ.

## Client

After Nuxt SSR renders the pages server-side it then hydrates them on the client side full of data and ready to connect to REST for updates. Vue then takes over for dynamic rendering.

## Presentation

And finally, we use PrimeVue and a whole suite of [custom components](subsystems/ui#components) for a list of client-side components and CSS. 