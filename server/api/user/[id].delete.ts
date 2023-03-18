import { User } from '../../../typeorm/entity/User';
import { vingSession, vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await User.findIdOrDie(id);
    user.canEdit(vingSession(event));
    await user.remove();
    return user.describe(vingDescribe(event));
});