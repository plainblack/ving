import { Users } from '~/utils/db';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findUnique({ where: { id: id } });
    return user.describe({ currentUser: event.context.ving.session, include: event.context.ving.include });
});