import { useKind } from '#ving/record/VingRecord.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = await useKind('APIKey');
    return APIKeys.mint().propOptions(describeParams(event), true);
});