import { useKind } from '#ving/record/utils.mjs';
import { describeListParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const S3Files = user.s3files;
    return await S3Files.describeList(describeListParams(event), describeListWhere(event, S3Files.describeListFilter()));
});