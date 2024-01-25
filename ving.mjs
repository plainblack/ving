#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "ving",
    version: "1.0.0",
    description: "ving CLI",
  },
  subCommands: {
    //  cache: () => import('./commands/cache.mjs').then((r) => r.default),
    //drizzle: () => import('./commands/drizzle.mjs').then((r) => r.default),
    //  email: () => import('./commands/email.mjs').then((r) => r.default),
    //  record: () => import('./commands/record.mjs').then((r) => r.default),
    schema: () => import('./commands/schema.mjs').then((r) => r.default),
    token: () => import('./commands/token.mjs').then((r) => r.default),
    //  user: () => import('./commands/user.mjs').then((r) => r.default),
  },
});

runMain(main);
