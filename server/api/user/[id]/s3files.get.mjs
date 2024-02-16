import { useUsers } from '../../../vingrecord/records/User.mjs';
import { describeListParams } from '../../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    const S3Files = user.s3files;
    return await S3Files.describeList(describeListParams(event), describeListWhere(event, S3Files.describeListFilter()));
});