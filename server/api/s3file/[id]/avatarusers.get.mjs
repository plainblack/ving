import { useS3Files } from '#ving/record/records/S3File.mjs';
import { describeListParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    const Users = s3file.avatarUsers;
    return await Users.describeList(describeListParams(event), describeListWhere(event, Users.describeListFilter()));
});