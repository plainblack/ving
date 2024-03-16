import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';


export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const oldAvatar = await user.parent('avatar');
    const session = obtainSession(event);
    user.canEdit(session);
    const body = await getBody(event);
    const S3Files = await useKind('S3File');
    const s3file = await S3Files.findOrDie(body.s3FileId);
    await s3file.postProcessFile();
    await s3file.verifyExtension(['png', 'jpeg', 'jpg', 'gif']);
    await s3file.verifyExactDimensions(300, 300);
    user.set('avatarId', s3file.get('id'));
    await user.update();
    await oldAvatar.delete();
    return await user.describe(describeParams(event, session));
});