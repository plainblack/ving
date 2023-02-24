import { Users } from '~/utils/db';
import { vingDescribe } from '~/utils/utils';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findUnique({ where: { id: id } });
    return user.describe(vingDescribe(event));
});