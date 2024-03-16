import { describe, test, expect } from "vitest";
import axios from 'axios'
import { getConfig } from '#ving/config.mjs';

const vingConfig = getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.defaultVersion}`;
describe('Test API', async () => {

    test('get /api/test', async () => {
        const result = await axios(base + 'test')
        expect(result.status).toBe(200);
        expect(result.data.success).toBe(true);
    });
})