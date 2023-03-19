import { Users } from '../../vingrecord/records/User';
import { vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(vingDescribe(event), true);
})
