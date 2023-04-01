import { useAPIKeys } from '../../../vingrecord/records/APIKey';
import { vingDescribe } from '../../../helpers';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    const user = await apikey.user;
    return await user.describe(vingDescribe(event));
});