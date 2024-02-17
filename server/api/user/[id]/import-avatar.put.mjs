import { useKind } from '#ving/record/VingRecord.mjs';
import { useS3Files } from '#ving/record/records/S3File.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';


export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const session = obtainSession(event);
    user.canEdit(session);
    const body = await getBody(event);
    const S3Files = useS3Files();
    const s3file = await S3Files.findOrDie(body.s3FileId);
    await s3file.postProcessFile();
    await s3file.verifyExtension(['png', 'jpeg', 'jpg', 'gif']);
    await s3file.verifyExactDimensions(300, 300);
    user.set('avatarId', s3file.get('id'));
    await user.update();
    return await user.describe(describeParams(event, session));
});