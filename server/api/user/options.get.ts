import { Users } from '~~/app/db';
import { vingDescribe } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(vingDescribe(event));
})
