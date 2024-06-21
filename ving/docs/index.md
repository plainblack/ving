---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Ving"
  text: ""
  tagline: An opinionated Nuxt starter with a REST API included
  actions:
    - theme: brand
      text: Installation
      link: /installation
    - theme: alt
      text: Architecture
      link: /architecture
    - theme: alt
      text: Subsystems
      link: /subsystems/cache
    - theme: alt
      text: Rest APIs
      link: /rest/User

features:
  - title: Code Generation
    details: Automatic code generation for all sub-systems
  - title: REST API
    details: Platform agnostic REST interface
  - title: Granular Privileges
    details: Per field privileges for view and edit
  - title: Auth
    details: Full session based auth system
  - title: Files
    details: AWS S3 based secure upload system
  - title: Messaging
    details: Per user message bus streamed via Server Sent Events
  - title: API Keys
    details: API key and privilege system with access to make requests on behalf of other users
  - title: UI
    details: A useful set of custom made Nuxt components and composables
  - title: Admin
    details: A full user interface for user management
  - title: Email
    details: A fully templated email sending system
  - title: Jobs
    details: An asynchronous background jobs system
---

---
# About Ving

Ving is a Web and REST code generation tool and services framework. It has a heavy focus on a strong and predictable backend, while having a flexible front end. 

Ving is written entirely in Javascript using [Nuxt 3](http://nuxt.com), [Vue 3](http://vuejs.org), [PrimeVue](https://primevue.org), [TailWind](https://tailwindcss.com) and [Drizzle](https://github.com/drizzle-team/drizzle-orm).


## How Ving is Constructed
Everything starts with the [Ving Schema](subsystems/ving-schema), which defines tables in a database, along with fields, privileges, and other properties. From there everything is automatically generated, but still modifyable by you. Ving will generate [database schemas and migrations](subsystems/drizzle), [server-side Javascript APIs](subsystems/ving-record), [REST APIs](subsystems/rest), [Web UIs](subsystems/ui), [email templates](subsystems/email), and more.


## Why Rest?
You might be wondering why REST in a world with tRPC and GraphQL. It's because REST is language agnostic, and very simple to understand. It's still the best data presentation layer when you have an API you want the general public to consume. And Ving is all about being fast to implement and easy to maintain. When you want simplcity, you do not want GraphQL or Typescript as there's nothing uncomplicated about either.


## Get the Code
You can [visit the GitHub repository](https://github.com/plainblack/ving) to get the source code and start using it.

## Install
[Start your installation now.](installation)