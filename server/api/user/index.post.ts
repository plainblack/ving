import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();
import { vingDescribe, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
  const user = await Users.createAndVerify(await vingBody(event));
  return user.describe(vingDescribe(event));
});