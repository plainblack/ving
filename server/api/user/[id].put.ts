import { User } from '../../../typeorm/entity/User';
import { vingDescribe, vingSession, vingBody } from '../../../app/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await User.findOneByOrFail({ id });
    user.canEdit(vingSession(event));
    await user.updateAndVerify(await vingBody(event), vingSession(event));
    return user.describe(vingDescribe(event));
});