import { useUsers } from '../../../vingrecord/records/User.mjs';
import { useS3Files } from '../../../vingrecord/records/S3File.mjs';
import { describeParams, obtainSession, getBody } from '../../../utils/rest.mjs';
import { useCache } from '../../../cache.mjs';
import { ouch } from '../../../utils/ouch.mjs';
import { defineEventHandler, getRouterParams } from 'h3';


export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    const session = obtainSession(event);
    user.canEdit(session);
    const body = await getBody(event);
    const S3Files = useS3Files();
    const s3file = await S3Files.findOrDie(body.s3FileId);
    await s3file.postProcessFile();
    // do some verification
    user.set('avatarId', s3file.get('id'));
    await user.update();
    return await user.describe(describeParams(event, session));
});