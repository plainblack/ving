#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "ving",
    description: "ving CLI",
  },
  subCommands: {
    cache: () => import('#ving/commands/cache.mjs').then((r) => r.default),
    drizzle: () => import('#ving/commands/drizzle.mjs').then((r) => r.default),
    email: () => import('#ving/commands/email.mjs').then((r) => r.default),
    messagebus: () => import('#ving/commands/messagebus.mjs').then((r) => r.default),
    record: () => import('#ving/commands/record.mjs').then((r) => r.default),
    schema: () => import('#ving/commands/schema.mjs').then((r) => r.default),
    token: () => import('#ving/commands/token.mjs').then((r) => r.default),
    user: () => import('#ving/commands/user.mjs').then((r) => r.default),
  },
});

runMain(main);
