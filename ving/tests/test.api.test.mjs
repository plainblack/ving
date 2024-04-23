import { describe, test, expect } from "vitest";
import { ofetch } from "ofetch";
import { getConfig } from '#ving/config.mjs';

const vingConfig = await getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.version}/`;
describe('Test API', async () => {

    test(`get ${base}`, async () => {
        const result = await ofetch(base + 'test')
        expect(result.success).toBe(true);
    });
})