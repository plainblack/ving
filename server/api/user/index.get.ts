import { useUsers } from '../../vingrecord/records/User';
import { describeListParams, obtainSessionIfRole } from '../../utils/rest';
import { describeListWhere } from '../../utils/rest';
import { like, or, SQL } from '../../drizzle/orm';
export default defineEventHandler(async (event) => {
  // comment the line below out if you want to allow mere users to access the user list
  obtainSessionIfRole(event, 'admin');
  const Users = useUsers();
  return await Users.describeList(describeListParams(event), describeListWhere(event, Users.describeListFilter()));
})
