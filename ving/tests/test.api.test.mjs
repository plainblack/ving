import { describe, test, expect } from "vitest";
import axios from 'axios'
import { getConfig } from '#ving/config.mjs';

const vingConfig = await getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.version}/`;
describe('Test API', async () => {

    test(`get ${base}`, async () => {
        const result = await axios(base + 'test')
        expect(result.status).toBe(200);
        expect(result.data.success).toBe(true);
    });
})