import { useUsers } from '../../vingrecord/records/User';
import { vingDescribe, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
  const Users = useUsers();
  const user = await Users.createAndVerify(await vingBody(event));
  return user.describe(vingDescribe(event));
});