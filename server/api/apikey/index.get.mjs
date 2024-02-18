import { useKind } from '#ving/record/VingRecord.mjs';
import { describeListParams, describeListWhere } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = await useKind('APIKey');
    return await APIKeys.describeList(describeListParams(event), describeListWhere(event, APIKeys.describeListFilter()));
});