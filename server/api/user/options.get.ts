import { Users } from '~/utils/db';
import { vingDescribe } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(vingDescribe(event));
})
