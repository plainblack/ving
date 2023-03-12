import { User } from '../../../typeorm/entity/User';
import { vingDescribe } from '../../../app/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await User.findIdOrDie(id);
    return user.describe(vingDescribe(event));
});