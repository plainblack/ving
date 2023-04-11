import { useUsers } from '../../vingrecord/records/User';
import { vingDescribeList, vingSessionIsRole, vingFilter } from '../../helpers';
import { like, or } from '../../drizzle/orm';
export default defineEventHandler(async (event) => {
  // comment the line below out if you want to allow mere users to access the user list
  //vingSessionIsRole(event, 'admin');
  const Users = useUsers();
  return await Users.describeList(vingDescribeList(event), vingFilter(event, Users));
})
