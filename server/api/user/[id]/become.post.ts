import { useUsers } from '../../../vingrecord/records/User';
import { describeParams, obtainSessionIfRole } from '../../../utils/rest';
import { Session } from '../../../session';
export default defineEventHandler(async (event) => {
    let session = obtainSessionIfRole(event, 'admin');
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    session.end();
    session = await Session.start(user);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return user.describe(describeParams(event));
});