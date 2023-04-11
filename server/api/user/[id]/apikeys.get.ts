import { useUsers } from '../../../vingrecord/records/User';
import { describeListParams } from '../../../utils/rest';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    const APIKeys = user.apikeys;
    return await APIKeys.describeList(describeListParams(event), describeListWhere(event, APIKeys.describeListFilter()));
});