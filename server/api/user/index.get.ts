import { useUsers } from '../../vingrecord/records/User';
import { vingDescribeList, vingSessionIsRole } from '../../helpers';
import { describeListWhere } from '../../utils/rest';
import { like, or, SQL } from '../../drizzle/orm';
export default defineEventHandler(async (event) => {
  // comment the line below out if you want to allow mere users to access the user list
  //vingSessionIsRole(event, 'admin');
  const Users = useUsers();
  //const filter = Users.describeListFilter()
  //const query = getQuery(event);
  /*let where: SQL | undefined = undefined;
  for (const column of filter.queryable) {
    if (where === undefined) {
      where = like(column, `%${query.search}%`);
    }
    else {
      where = or(like(column, `%${query.search}%`))
    }
  }*/
  return await Users.describeList(vingDescribeList(event), describeListWhere(event, Users.describeListFilter()));
})
