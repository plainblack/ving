import { Users } from '~~/app/db';
import { vingDescribe } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.find(id);
    return user.describe(vingDescribe(event));
});