import { Users } from '~/utils/db';
import { ouch } from '~/utils/utils';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findUnique({ where: { id: id } });
    if (user.isOwner(event.context.ving.session)) {
        await user.delete();
        return user.describe({ currentUser: event.context.ving.session, include: event.context.ving.include });
    }
    throw ouch(403, 'No way Jose')
});