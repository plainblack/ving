import { Users } from '~/utils/db';
import { vingDescribe } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await Users.createAndVerify(body);
  return user.describe(vingDescribe(event));
});