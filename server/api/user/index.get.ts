import { useUsers } from '../../vingrecord/records/User';
import { vingDescribeList, vingSession, ouch } from '../../helpers';
import { like, or } from '../../drizzle/orm';
export default defineEventHandler(async (event) => {
  const session = vingSession(event);
  // comment the 2 lines below out if you want to allow mere users to access the user list
  if (session === undefined || !session.isRole('admin'))
    throw ouch(403, 'You must be an admin to do that.');
  const Users = useUsers();
  const query = getQuery(event);
  let where = undefined;
  if (query.search) {
    where = or(like(Users.table.username, `%${query.search}%`), like(Users.table.realName, `%${query.search}%`), like(Users.table.email, `%${query.search}%`))
  }
  return await Users.describeList(vingDescribeList(event), where);
})
