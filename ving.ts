#!/usr/bin/env tsx
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "ving",
    version: "1.0.0",
    description: "ving CLI",
  },
  subCommands: {
    // build: () => import('./commands/build').then((r) => r.default),
    // deploy: () => import('./commands/deploy').then((r) => r.default),
    cache: () => import('./commands/cache').then((r) => r.default),
    drizzle: () => import('./commands/drizzle').then((r) => r.default),
    schema: () => import('./commands/schema').then((r) => r.default),
    user: () => import('./commands/user').then((r) => r.default),
  },
});

runMain(main);
