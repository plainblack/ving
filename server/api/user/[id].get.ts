import { User } from '../../../typeorm/entity/User';
import { vingDescribe } from '../../../app/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await User.findOneOrFail(id);
    return user.describe(vingDescribe(event));
});