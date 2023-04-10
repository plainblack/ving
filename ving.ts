#!/usr/bin/env tsx
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "ving",
    version: "1.0.0",
    description: "ving CLI",
  },
  subCommands: {
    cache: () => import('./commands/cache').then((r) => r.default),
    drizzle: () => import('./commands/drizzle').then((r) => r.default),
    record: () => import('./commands/record').then((r) => r.default),
    schema: () => import('./commands/schema').then((r) => r.default),
    token: () => import('./commands/token').then((r) => r.default),
    user: () => import('./commands/user').then((r) => r.default),
  },
});

runMain(main);
