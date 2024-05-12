#!/usr/bin/env -S node --env-file=.env
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "ving.mjs",
    description: "ving CLI",
  },
  subCommands: {
    alert: () => import('#ving/cli/alert.mjs').then((r) => r.default),
    cache: () => import('#ving/cli/cache.mjs').then((r) => r.default),
    drizzle: () => import('#ving/cli/drizzle.mjs').then((r) => r.default),
    email: () => import('#ving/cli/email.mjs').then((r) => r.default),
    id: () => import('#ving/cli/id.mjs').then((r) => r.default),
    jobs: () => import('#ving/cli/jobs.mjs').then((r) => r.default),
    messagebus: () => import('#ving/cli/messagebus.mjs').then((r) => r.default),
    record: () => import('#ving/cli/record.mjs').then((r) => r.default),
    schema: () => import('#ving/cli/schema.mjs').then((r) => r.default),
    user: () => import('#ving/cli/user.mjs').then((r) => r.default),
  },
});

runMain(main,);
