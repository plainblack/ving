import { useUsers } from '../../vingrecord/records/User';
import { vingDescribeList, vingSessionIsRole } from '../../helpers';
import { like, or } from '../../drizzle/orm';
export default defineEventHandler(async (event) => {
  // comment the line below out if you want to allow mere users to access the user list
  vingSessionIsRole(event, 'admin');
  const Users = useUsers();
  const query = getQuery(event);
  let where = undefined;
  if (query.search) {
    where = or(like(Users.table.username, `%${query.search}%`), like(Users.table.realName, `%${query.search}%`), like(Users.table.email, `%${query.search}%`))
  }
  return await Users.describeList(vingDescribeList(event), where);
})
