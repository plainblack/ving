import { ouch } from '#ving/utils/ouch.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    throw ouch(403, 'Not allowed!');
});