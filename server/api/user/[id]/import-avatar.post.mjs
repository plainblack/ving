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
    const s3key = body.s3key;
    const match = s3key.match(/^(.*)\/(.*)$/g);
    const s3folder = match[1];
    const filename = match[2];

    const s3file = useS3Files().mint({
        s3folder,
        filename,
    });

    await s3file.importMetadata(s3key);
    await s3file.importFromTemp();


    console.log('NOTICE: ' + s3file.get('id'));

    return await user.describe(describeParams(event));
});